# -*- coding: utf-8 -*-
# @Date    : 2018-04-10 15:58:44
# @Author  : hwp (hwppippo@gmail.com)
# @Link    : link
# @Version : 1.0.0

import logging
logging.basicConfig(level=logging.INFO)

import asyncio, os, json, time
from datetime import datetime
from aiohttp import web


def index(request):
    return web.Response(
        body=b'<h1>planAssistant</h1>', headers={'content-type': 'text/html'})


@asyncio.coroutine
def init(loop):
    app = web.Application(loop=loop)
    app.router.add_route('GET', '/', index)
    srv = yield from loop.create_server(app.make_handler(), '127.0.0.1', 9000)
    logging.info('server started at http://127.0.0.1:9000')
    return srv


loop = asyncio.get_event_loop()
loop.run_until_complete(init(loop))
loop.run_forever()