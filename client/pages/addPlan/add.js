var pickerFile = require('../tools/js/picker_datetime.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var util = require('../../utils/util.js');
var config = require('../../utils/config.js')
var prj_value,car_value;

Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',

    array: ['交大项目', '秦汉大道', '秦韵佳苑', '司法小区'],
    car:['陕A34512','陕A34LB3'],
    people: ''
  },

  onLoad: function () {
    this.datetimePicker = new pickerFile.pickerDatetime({
      page: this,
      animation: 'slide',
      duration: 500
    });
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        that.data.people = userInfo.nickName
      }
    })
  },

  prjTap: function (e) {
    this.setData({
      prj_index: e.detail.value
    })
    prj_value = this.data.array[e.detail.value];
  },
  carTap: function (e) {
    this.setData({
      car_index: e.detail.value
    })
    car_value = this.data.car[e.detail.value];
  },
  startTap: function () {
    this.datetimePicker.setPicker('startDate');
  },
  endTap: function () {
    this.datetimePicker.setPicker('endDate');
  },
  commet: function (e) {
    this.setData({
      commet: e.detail.value
    })
  },

  placeContent: function (e) {
    this.setData({
      placeContent: e.detail.value
    })
  },
  formSubmit: function (e) {
    console.log('项目部', prj_value);
    console.log('车辆', car_value);
    console.log('时间值', this.data.startDate);
    console.log('时间值', this.data.endDate);
    console.log('人员', this.data.people);
    console.log('事由', this.data.commet);
    console.log('目的地', this.data.placeContent);
    var location = wx.getStorageSync('address')
    console.log('当前位置', location);
    var openId = wx.getStorageSync('openId');
    console.log(openId);

    if (prj_value == null) {
      util.showError('项目不能为空')
    } else if (car_value == null) {
      util.showError('车辆不能为空')
    }else if (this.data.startDate == null || this.data.endDate == null) {
      util.showError('时间不能为空')
    } else if (e.detail.value.destPlace.length == 0) {
      util.showError('目的地不能为空')
    } else {
      wx.request({
        url: 'https://4z2dgktq.qcloud.la/weapp/planOrder/add',
        data: {
          prj: prj_value, carNum:car_value,
          open_id: openId,
          startTime: this.data.startDate, endTime:
          this.data.endDate, user: this.data.people,
          commet: this.data.commet,
          location: location, destPlace: e.detail.value.destPlace
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        }, // 设置请求的 header
        success: function (res) {
          console.log(res);
          util.showSuccess('添加成功')
        },
        fail: function (res) {
          console.log(res);
        }
      })
    }
  }
})
