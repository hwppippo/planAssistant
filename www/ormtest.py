import json
import logging
import time

import requests

from app.models import AccessToken, User
from orm import create_pool

logging.basicConfig(level=logging.INFO)
import asyncio
from app.models import UserAuth, CarOrderPlan, UserFormid

loop = asyncio.get_event_loop()


# 插入
async def insert():
    await orm.create_pool(loop, user='root', password='root', db='python_test')
    u = User(
        name='Test2',
        email='test2@example.com',
        passwd='1234567890',
        image='about:blank')

    await u.save()

    r = await User.findAll()
    print(r)


# 删除
async def remove():
    await orm.create_pool(loop, user='root', password='password', db='awesome')
    r = await User.find('0015235051719167defcb54273f49f7b9a3a8d50df59e46000')
    await r.remove()
    print('remove', r)
    await orm.destory_pool()


# 更新
async def update():
    await orm.create_pool(loop, user='root', password='root', db='python_test')
    r = await User.find('0015235051719167defcb54273f49f7b9a3a8d50df59e46000')
    r.passwd = '7653'
    response = await r.update()
    print('update', response)
    await orm.destory_pool()


async def find():
    await orm.create_pool(loop, user='root', password='root', db='python_test')
    all = await User.findAll('passwd="123456" and name="Test3"')
    print(all)
    # pk = await User.find('00149276202953187d8d3176f894f1fa82d9caa7d36775a000')
    # print(pk)
    # num = await User.findNumber('email')
    # print(num)

    await orm.destory_pool()


import urllib.request


async def getToken(flag):
    # 判断缓存
    url = "https://api.weixin.qq.com/cgi-bin/token?" \
          "grant_type=client_credential&appid=wx690dfbed2a3aba97&secret=0718a86f51fa9ab7b76c950472c89530"
    f = urllib.request.urlopen(url)
    s = f.read()
    # 读取json数据
    j = json.loads(s)
    j.keys()
    token = j['access_token']
    AccessExpires = int(time.time()) + j['expires_in']
    print(AccessExpires)
    await orm.create_pool(loop, user='root', password='root', db='wzhi_car')
    if flag:
        r = await AccessToken.findNumber('id')
        r.AccessExpires = AccessExpires
        await r.update()
    else:
        # 存到数据库
        accessToken = AccessToken(appid='wx690dfbed2a3aba97', access_token=token,
                                  AccessExpires=AccessExpires,
                                  update_time=time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())))
        await accessToken.save()


async def checkToken():
    await orm.create_pool(loop, user='root', password='root', db='wzhi_car')

    AccessExpires = await AccessToken.findNumber('AccessExpires')
    if AccessExpires is None:
        await getToken(0)
        return
    if int(json.dumps(AccessExpires)) > int(time.time()):
        # 未超时，直接返回access_token
        access_token = await AccessToken.findNumber('access_token')
        print(json.dumps(access_token))
    else:
        await getToken(1)

    await orm.destory_pool()


loop.run_until_complete(update())
loop.close()
