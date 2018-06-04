# -*- coding: utf-8 -*-
# @Date    : 2018-04-12 23:49:44
# @Author  : hwp (hwppippo@gmail.com)
# @Link    : link
# @Version : 1.0.0

' url handlers '

import logging
import json
import requests
import time

import wechatPush
from config import configs
from coroweb import get, post
from qiniu.auth import Auth
from models import UserAuth, CarOrderPlan, UserFormid, CarCost


@get('/login')
async def api_get_loginSession(*, code):
    # 获取 wx 的 openid 和 session-key
    url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + configs.appid + "&secret=" + configs.secret \
          + "&js_code=" + code + "&grant_type=authorization_code"

    # response = json.loads(requests.get(url).text)
    response = requests.get(url)
    # logging.info('url:%s' % response.text)
    if response.status_code == 200:
        data = {"code": 0, "access_token": json.loads(response.text)['openid']}
    else:
        data = {"code": -1, "access_token": ""}

    return json.dumps(data)


@get('/carPlans')
async def api_get_carPlans(*, access_token):
    # 先查询权限
    conditions = 'openid=' + '"' + access_token + '"'
    auths = await UserAuth.findAll(conditions)
    # logging.info(auths)
    if len(auths) == 0:
        data = {"code": -1, "data": "", "cauth": ""}
    else:
        conditions = conditions + ' and ' + 'comName=' + auths[0][
            'comName'] + ' and create_time > DATE_SUB(NOW(), INTERVAL 1 DAY)'
        if auths[0]['cauth'] == 1:
            conditions = 'comName=' + auths[0]['comName'] + ' and create_time > DATE_SUB(NOW(), INTERVAL 1 DAY)'
        carPlans = await CarOrderPlan.findAll(
            conditions, orderBy='startTime desc')
        # logging.info(carPlans)
        if len(carPlans) != 0:
            # 构造字典
            data = {"code": 0, "data": carPlans, "cauth": auths[0]['cauth']}
        else:
            data = {"code": -1, "data": "", "cauth": ""}

    return json.dumps(data)


def encode_approval_pending(startTime, car, destPlace, commet):
    color = "#000"
    data = {
        "keyword1": {
            "value": startTime,
            "color": color
        },
        "keyword2": {
            "value": car,
            "color": color
        },
        "keyword3": {
            "value": destPlace,
            "color": color
        },
        "keyword4": {
            "value": commet,
            "color": color
        }
    }

    return data


def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        pass

    try:
        import unicodedata
        unicodedata.numeric(s)
        return True
    except (TypeError, ValueError):
        pass

    return False


@post('/newCarPlans')
async def api_newCarPlans(*,
                          prj,
                          carNum,
                          openid,
                          startTime,
                          endTime,
                          user,
                          commet="",
                          location,
                          destPlace,
                          form_id):
    carPlan = CarOrderPlan(
        comName="1",
        prj=prj,
        carNum=carNum,
        openid=openid,
        startTime=startTime,
        endTime=endTime,
        user=user,
        commet=commet,
        isStop="待审批",
        location=location,
        destPlace=destPlace)

    response = await carPlan.save()
    data = {}
    if response == 1:
        if is_number(form_id):
            # 添加提交的 form_id
            userform = UserFormid(formid=form_id, openid=openid)
            await userform.save()
        # 发送消息模板
        # 先查询 form_id
        conditions = 'openid=' + '"' + configs.openid + '"'
        r = await UserFormid.findOne('id, formid', conditions)
        print(r)
        # 拼接数据
        if r is not None:
            value = encode_approval_pending(startTime, carNum, destPlace,
                                            commet)
            response = await wechatPush.do_push(
                configs.openid, configs.undone_template, r['formid'], value,
                "keyword4.DATA")
            await r.remove()
        data['code'] = 0
        data['msg'] = response
    else:
        data['code'] = -1
        data['msg'] = ''
    return json.dumps(data)


def encode_approval_complete(orderTime, car, state):
    color = "#000"
    data = {
        "keyword1": {
            "value": orderTime,
            "color": color
        },
        "keyword2": {
            "value": car,
            "color": color
        },
        "keyword3": {
            "value": state,
            "color": color
        }
    }
    return data


@get('/doCarPlans')
async def api_doCarPlans(*, itemid, carNum, openid, startTime, approvalCommet,
                         state, form_id):
    r = await CarOrderPlan.find(itemid)
    r.isStop = state
    r.approvalCommet = approvalCommet
    response = await r.update()
    data = {}
    if response == 1:
        try:
            data['code'] = 0
            return json.dumps(data)
        finally:
            # 添加提交的 form_id
            userform = UserFormid(formid=form_id, openid=openid)
            await userform.save()
            # 先查询 form_id
            conditions = 'openid=' + '"' + openid + '"'
            r = await UserFormid.findOne('id,formid', conditions)
            if r is not None:
                # 拼接数据
                value = encode_approval_complete(startTime, carNum, state)
                await wechatPush.do_push(openid, configs.done_template,
                                         r['formid'], value, "keyword3.DATA")
                await r.remove()
    else:
        data['code'] = -1

    return json.dumps(data)


@get('/delCarPlans')
async def api_delCarPlans(*, itemid):
    r = await CarOrderPlan.find(itemid)
    await r.remove()
    print('remove', r)
    if r:
        data = {"code": 0}
    else:
        data = {"code": -1}
    return json.dumps(data)


@get('/carCosts')
async def api_get_carCosts(*, access_token, page):
    # 先查询权限
    conditions = 'openid=' + '"' + access_token + '"'
    auths = await UserAuth.findAll(conditions)
    # logging.info(auths)
    if len(auths) == 0:
        data = {"code": -1, "data": "", "cauth": ""}
    else:
        limit = " LIMIT %d,%d" % ((int(page) - int(1)) * int(5), 5)
        conditions = conditions + ' and ' + 'comName=' + auths[0][
            'comName'] + " ORDER by create_time DESC " + limit
        if auths[0]['cauth'] == 1:
            conditions = 'comName=' + auths[0]['comName'] + " ORDER by create_time DESC " + limit
        logging.info("查询条件 %s " % conditions)

        carCost = await CarCost.findAll(conditions)
        if len(carCost) != 0:
            # 构造字典
            data = {"code": 0, "data": carCost, "cauth": auths[0]['cauth']}
        else:
            data = {"code": -1, "data": "", "cauth": ""}

    return json.dumps(data)


@post('/newCarCosts')
async def api_newCarCosts(*,
                          prj,
                          carNum,
                          openid,
                          repair_type,
                          repair_time,
                          repair_cost,
                          invoice="",
                          deduct,
                          repair_location,
                          commet,
                          form_id):
    if repair_type == "停车费":
        flagIcon = "http://p77srvwbm.bkt.clouddn.com/p.png"
    elif repair_type == "过路费":
        flagIcon = "http://p77srvwbm.bkt.clouddn.com/speed.png"
    elif repair_type == "加油费":
        flagIcon = "http://p77srvwbm.bkt.clouddn.com/oil.png"
    elif repair_type == "日常保养":
        flagIcon = "http://p77srvwbm.bkt.clouddn.com/wash.png"
    elif repair_type == "违章缴费":
        flagIcon = "http://p77srvwbm.bkt.clouddn.com/w.png"

    carCost = CarCost(
        comName="1",
        prj=prj,
        carNum=carNum,
        openid=openid,
        repairType=repair_type,
        repairTime=repair_time,
        repairCost=repair_cost,
        invoice=invoice,
        deduct=deduct,
        commet=commet,
        repairLocation=repair_location,
        flagIcon=flagIcon)

    response = await carCost.save()
    data = {}
    if response == 1:
        # 添加提交的 form_id
        userform = UserFormid(
            formid=form_id,
            openid=openid,
            update_time=time.strftime('%Y-%m-%d', time.localtime(time.time())))
        await userform.save()
        data['code'] = 0
    else:
        data['code'] = -1
    return json.dumps(data)


@get('/delCarCosts')
async def api_delCarCosts(*, itemid):
    r = await CarCost.find(itemid)
    await r.remove()
    print('remove', r)
    if r:
        data = {"code": 0}
    else:
        data = {"code": -1}
    return json.dumps(data)


@get('/countCarCosts')
async def api_countCarCosts():
    count = 'sum(repairCost)'
    # 计算过路费、加油费、保养费、违章缴费
    costType = ['过路费', '加油费', '保养费', '违章缴费']
    data = []

    for cost in costType:
        conditions = 'repairType = "' + cost + '"'
        value = await CarCost.findOne(count, conditions, count=1)
        if value[count] is None:
            value[count] = 0
        data.append(value[count])

    year = await CarCost.findOne('YEAR(CURRENT_DATE)', '', count=1)
    for cost in costType:
        type = 'repairType = "' + cost + '"'
        for index in range(12):
            conditions = 'YEAR(create_time)= "' + str(year['YEAR(CURRENT_DATE)']) + '" AND MONTH(create_time)="' + str(
                index + 1) + '" AND ' + type
            value = await CarCost.findOne(count, conditions, count=1)
            if value[count] is None:
                value[count] = 0
            print(value[count])

            data.append(value[count])

    print(len(data))
    return data


@get('/qiniuToken')
async def api_getQiniuToken():
    # 需要填写你的 Access Key 和 Secret Key
    access_key = 'z7x1-PWg6Swytf7LHd4aEBkrvkfg2AFPYCfDfihC'
    secret_key = 'kT2ii7yyIvAFcCwuePKcioiwycTZ8QAPM6DZ14xV'

    # 构建鉴权对象
    q = Auth(access_key, secret_key)

    # 要上传的空间
    bucket_name = 'wzhi-car'

    # 生成上传 Token，可以指定过期时间等
    policy = {}
    token = q.upload_token(bucket_name, None, 3600, policy)

    data = {'uptoken': token}
    return json.dumps(data)
