import urllib.request, json
import time
import requests
from models import AccessToken
from config import configs
import globalVar as GlobalVar


class WechatPush(object):
    def __init__(self, appid, secrect):
        self.appid = appid
        self.secrect = secrect


# 检测 accessToken 是否存在
async def checkToken():
    AccessExpires = await AccessToken.findNumber('AccessExpires')
    if AccessExpires is None:
        await getToken(0)
        return
    print(AccessExpires)
    print(int(time.time()))
    if int(json.dumps(AccessExpires)) > int(time.time()):
        print("未超时")
        # 未超时，直接返回access_token
        access_token = await AccessToken.findNumber('access_token')
        GlobalVar.set_access_token(access_token)
    else:
        print("超时")
        await getToken(1)


# 获取accessToken
async def getToken(flag):
    # 判断缓存
    url = configs.access_token_url + configs.appid + "&secret=" + configs.secrect
    f = urllib.request.urlopen(url)
    s = f.read()
    # 读取json数据
    s = bytes.decode(s)
    print("s : %s" % s)

    j = json.loads(s)
    j.keys()
    token = j['access_token']
    GlobalVar.set_access_token(token)
    AccessExpires = int(time.time()) + 6000

    if flag == 1:
        r = await AccessToken.findAll()
        print(r)
        r[0].AccessExpires = AccessExpires
        await r[0].update()
    else:
        # 存到数据库
        accessToken = AccessToken(appid=configs.appid, access_token=token, AccessExpires=AccessExpires)
        await accessToken.save()


# 开始推送
async def do_push(touser, template_id, form_id, data, keyword):
    await checkToken()
    params = ({'touser': touser,  # 用户openid
               'template_id': template_id,  # 模板消息ID
               'color': '',  # 颜色
               'form_id': form_id,
               'data': data,
               'emphasis_keyword': keyword,
               'page': "pages/index/index",
               })
    content = post_data(configs.template_url, json.dumps(params))

    return content


def post_data(url, data):
    querystring = {"access_token": GlobalVar.get_access_token()}
    headers = {
        'content-type': "application/json",
    }
    response = requests.request("POST", url, data=data, headers=headers, params=querystring)
    return response.text
