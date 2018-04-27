# -*- coding: utf-8 -*-
# @Date    : 2018-04-12 11:49:08
# @Author  : hwp (hwppippo@gmail.com)
# @Link    : link
# @Version : 1.0.0

import time, uuid
from orm import Model, StringField, BooleanField, FloatField

def next_id():
    return '%015d%s000' % (int(time.time() * 1000), uuid.uuid4().hex)

class User(Model):
    __table__ = 'users'

    id = StringField(primary_key=True, default=next_id, ddl='varchar(50)')
    email = StringField(ddl='varchar(50)')
    passwd = StringField(ddl='varchar(50)')
    admin = BooleanField()
    name = StringField(ddl='varchar(50)')
    image = StringField(ddl='varchar(500)')
    created_at = FloatField(default=time.time)

class AccessToken(Model):
    __table__ = 'AccessToken'

    id = StringField(primary_key=True, default=next_id, ddl='varchar(50)')
    appid = StringField(ddl='varchar(50)')
    access_token = StringField(ddl='varchar(500)')
    AccessExpires = StringField(ddl='varchar(50)')


class CarOrderPlan(Model):
    __table__ = 'carOrderPlan'

    id = StringField(primary_key=True, default=next_id, ddl='varchar(50)')
    comName = StringField(ddl='varchar(2)')
    openid = StringField(ddl='varchar(500)')
    user = StringField(ddl='varchar(50)')
    prj = StringField(ddl='varchar(50)')
    carNum = StringField(ddl='varchar(50)')
    startTime = StringField(ddl='varchar(500)')
    endTime = StringField(ddl='varchar(50)')
    realEndTime = StringField(ddl='varchar(50)')
    commet = StringField(ddl='varchar(500)')
    location = StringField(ddl='varchar(150)')
    isStop = StringField(ddl='varchar(10)')
    destPlace = StringField(ddl='varchar(50)')


class CarCost(Model):
    __table__ = 'carRepair'

    id = StringField(primary_key=True, default=next_id, ddl='varchar(50)')
    comName = StringField(ddl='varchar(2)')
    openid = StringField(ddl='varchar(500)')
    carNum = StringField(ddl='varchar(50)')
    repairType = StringField(ddl='varchar(50)')
    repairTime = StringField(ddl='varchar(50)')
    repairCost = StringField(ddl='varchar(4)')
    invoice = StringField(ddl='varchar(150)')
    deduct = StringField(ddl='varchar(2)')
    repairLocation = StringField(ddl='varchar(150)')
    commet = StringField(ddl='varchar(50)')


class UserAuth(Model):
    __table__ = 'userAuth'

    id = StringField(primary_key=True, default=next_id, ddl='varchar(50)')
    comName = StringField(ddl='varchar(2)')
    openid = StringField(ddl='varchar(100)')
    cauth = StringField(ddl='int(2)')


class UserFormid(Model):
    __table__ = 'userFormid'

    id = StringField(primary_key=True, default=next_id, ddl='varchar(50)')
    formid = StringField(ddl='varchar(100)')
    openid = StringField(ddl='varchar(100)')
