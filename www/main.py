import logging
logging.basicConfig(level=logging.INFO)

import asyncio, os, json, time
from datetime import datetime

from aiohttp import web
from jinja2 import Environment, FileSystemLoader

from config import configs

import orm
from coroweb import add_routes

# 这个函数的作用就是当有 http 请求的时候，通过 logging.info 输出请求的信息，其中包括请求的方法和路径
@asyncio.coroutine
def logger_factory(app, handler):
    @asyncio.coroutine
    def logger(request):
        logging.info('Request: %s %s' % (request.method, request.path))
        # yield from asyncio.sleep(0.3)
        # handler 为处理函数，request 为参数
        return (yield from handler(request))

    return logger


@asyncio.coroutine
def data_factory(app, handler):
    @asyncio.coroutine
    def parse_data(request):
        if request.method == 'POST':
            if request.content_type.startswith('application/json'):
                request.__data__ = yield from request.json()
                logging.info('request json: %s' % str(request.__data__))
            elif request.content_type.startswith(
                    'application/x-www-form-urlencoded'):
                request.__data__ = yield from request.post()
                logging.info('request form: %s' % str(request.__data__))
        return (yield from handler(request))

    return parse_data

# 请求对象 request 的处理工序流水线先后依次是：
# logger_factory->response_factory->RequestHandler().__call__->get 或 post->handler
# 对应的响应对象 response 的处理工序流水线先后依次是:
# 由 handler 构造出要返回的具体对象
# 然后在这个返回的对象上加上'__method__'和'__route__'属性，以标识别这个对象并使接下来的程序容易处理
# RequestHandler 目的就是从请求对象 request 的请求 content 中获取必要的参数，调用 URL 处理函数, 然后把结果返回给 response_factory
# response_factory 在拿到经过处理后的对象，经过一系列类型判断，构造出正确 web.Response 对象，以正确的方式返回给
@asyncio.coroutine
def response_factory(app, handler):
    @asyncio.coroutine
    def response(request):
        logging.info('Response handler...')
        r = yield from handler(request)
        if isinstance(r, web.StreamResponse):
            return r
        if isinstance(r, bytes):
            resp = web.Response(body=r)
            resp.content_type = 'application/octet-stream'
            return resp
        if isinstance(r, str):
            if r.startswith('redirect:'):
                return web.HTTPFound(r[9:])
            resp = web.Response(body=r.encode('utf-8'))
            resp.content_type = 'text/html;charset=utf-8'
            return resp
        if isinstance(r, dict):
            template = r.get('__template__')
            if template is None:
                resp = web.Response(
                    body=json.dumps(
                        r, ensure_ascii=False, default=lambda o: o.__dict__)
                    .encode('utf-8'))
                resp.content_type = 'application/json;charset=utf-8'
                return resp
            else:
                r['__user__'] = request.__user__
                resp = web.Response(body=app['__templating__'].get_template(
                    template).render(**r).encode('utf-8'))
                resp.content_type = 'text/html;charset=utf-8'
                return resp
        if isinstance(r, int) and t >= 100 and t < 600:
            return web.Response(t)
        if isinstance(r, tuple) and len(r) == 2:
            t, m = r
            if isinstance(t, int) and t >= 100 and t < 600:
                return web.Response(t, str(m))
        # default:
        resp = web.Response(body=str(r).encode('utf-8'))
        resp.content_type = 'text/plain;charset=utf-8'
        return resp

    return response


@asyncio.coroutine
def init(loop):
    yield from orm.create_pool(loop=loop, **configs.db)
    # 这是装饰模式的体现，logger_factory, response_factory 都是 URL 处理函数前（如 handler.index）的装饰功能
    app = web.Application(
        loop=loop, middlewares=[logger_factory, response_factory])
    add_routes(app, 'handlers')
    srv = yield from loop.create_server(app.make_handler(), '0.0.0.0', 9000)
    logging.info('server started at http://0.0.0.0:9000...')
    return srv


loop = asyncio.get_event_loop()
loop.run_until_complete(init(loop))
loop.run_forever()