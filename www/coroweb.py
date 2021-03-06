# -*- coding: utf-8 -*-
# @Date    : 2018-04-12 15:36:57
# @Author  : hwp (hwppippo@gmail.com)
# @Link    : link
# @Version : 1.0.0

import asyncio, inspect, logging, functools
import os
from urllib import parse
from aiohttp import web
from apis import APIError


def get(path):
    '''
    Define decorator @get('/path')
    '''

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            return func(*args, **kw)

        wrapper.__method__ = 'GET'
        wrapper.__route__ = path
        return wrapper

    return decorator


def post(path):
    '''
    Define decorator @post('/path')
    '''

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            return func(*args, **kw)

        wrapper.__method__ = 'POST'
        wrapper.__route__ = path
        return wrapper

    return decorator


def get_required_kw_args(fn):
    args = []
    params = inspect.signature(fn).parameters
    for name, param in params.items():
        if param.kind == inspect.Parameter.KEYWORD_ONLY and param.default == inspect.Parameter.empty:
            args.append(name)
    return tuple(args)


def get_named_kw_args(fn):
    args = []
    params = inspect.signature(fn).parameters
    for name, param in params.items():
        if param.kind == inspect.Parameter.KEYWORD_ONLY:
            args.append(name)
    return tuple(args)


def has_named_kw_args(fn):
    params = inspect.signature(fn).parameters
    for name, param in params.items():
        if param.kind == inspect.Parameter.KEYWORD_ONLY:
            return True


def has_var_kw_arg(fn):
    params = inspect.signature(fn).parameters
    for name, param in params.items():
        if param.kind == inspect.Parameter.VAR_KEYWORD:
            return True


def has_request_arg(fn):
    sig = inspect.signature(fn)
    params = sig.parameters
    found = False
    for name, param in params.items():
        if name == 'request':
            found = True
            continue
        if found and (param.kind != inspect.Parameter.VAR_POSITIONAL
                      and param.kind != inspect.Parameter.KEYWORD_ONLY
                      and param.kind != inspect.Parameter.VAR_KEYWORD):
            raise ValueError(
                'request parameter must be the last named parameter in function: %s%s'
                % (fn.__name__, str(sig)))
    return found


class RequestHandler(object):
    def __init__(self, app, fn):
        self._app = app
        self._func = fn
        self._has_request_arg = has_request_arg(fn)  # 是否有request参数
        self._has_var_kw_arg = has_var_kw_arg(fn)  # 是否有变长字典参数
        self._has_named_kw_args = has_named_kw_args(fn)  # 是否存在关键字参数
        self._named_kw_args = get_named_kw_args(fn)  # 所有关键字参数
        self._required_kw_args = get_required_kw_args(fn)  # 所有没有默认值的关键字参数

    @asyncio.coroutine
    def __call__(self, request):
        kw = None
        if self._has_var_kw_arg or self._has_named_kw_args or self._required_kw_args:
            if request.method == 'POST':
                if not request.content_type:
                    return web.HTTPBadRequest('Missing Content-Type.')
                ct = request.content_type.lower()
                if ct.startswith('application/json'):
                    params = yield from request.json()
                    if not isinstance(params, dict):
                        return web.HTTPBadRequest('JSON body must be object.')
                    kw = params
                elif ct.startswith('application/x-www-form-urlencoded'
                                   ) or ct.startswith('multipart/form-data'):
                    params = yield from request.post()
                    kw = dict(**params)
                else:
                    return web.HTTPBadRequest(
                        'Unsupported Content-Type: %s' % request.content_type)
            if request.method == 'GET':
                qs = request.query_string
                if qs:
                    kw = dict()
                    for k, v in parse.parse_qs(qs, True).items():
                        kw[k] = v[0]
        if kw is None:
            # 参数为空说明没有从 request 对象中获取到参数, 或者 URL 处理函数没有参数
            kw = dict(**request.match_info)
        else:
            if not self._has_var_kw_arg and self._named_kw_args:
                # remove all unamed kw: 从 request_content 中删除 URL 处理函数中所有不需要的参数
                copy = dict()
                for name in self._named_kw_args:
                    if name in kw:
                        copy[name] = kw[name]
                kw = copy
            # check named arg: 检查关键字参数的名字是否和 match_info 中的重复
            for k, v in request.match_info.items():
                if k in kw:
                    logging.warning(
                        'Duplicate arg name in named arg and kw args: %s' % k)
                kw[k] = v
        if self._has_request_arg:
            kw['request'] = request
        logging.info('call with args: %s' % str(kw))
        # check required kw: 检查是否有必须关键字参数
        if self._required_kw_args:
            for name in self._required_kw_args:
                if not name in kw:
                    return web.HTTPBadRequest('Missing argument: %s' % name)
        try:
            r = yield from self._func(**kw)
            return r
        except APIError as e:
            return dict(error=e.error, data=e.data, message=e.message)


def add_route(app, fn):
    # 通过装饰器返回 method 和 route
    method = getattr(fn, '__method__', None)
    path = getattr(fn, '__route__', None)
    if path is None or method is None:
        raise ValueError('@get or @post not defined in %s.' % str(fn))
    if not asyncio.iscoroutinefunction(fn) and not inspect.isgeneratorfunction(
            fn):
        fn = asyncio.coroutine(fn)

    logging.info('add route %s %s => %s(%s)' %
                 (method, path, fn.__name__,
                  ', '.join(inspect.signature(fn).parameters.keys())))
    # 正式注册为对应的 url 处理函数
    # 因此 RequestHandler(app, fn) 相当于创建了一个 url 处理函数，函数名就是 fn
    app.router.add_route(method, path, RequestHandler(app, fn))


def add_routes(app, module_name):
    n = module_name.rfind('.')
    # 导入模块处理函数
    if n == (-1):
        mod = __import__(module_name, globals(), locals())
    else:
        name = module_name[n + 1:]
        mod = getattr(
            __import__(module_name[:n], globals(), locals(), [name], name))
    for attr in dir(mod):
        if attr.startswith('-'):
            continue
        fn = getattr(mod, attr)
        if callable(fn):
            method = getattr(fn, '__method__', None)
            path = getattr(fn, '__route__', None)
            if method and path:
                add_route(app, fn)
