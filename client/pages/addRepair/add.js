var pickerFile = require('../tools/js/picker_datetime.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var util = require('../../utils/util.js');
var config = require('../../utils/config.js')
var prj_value, car_value, type_value;

Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    array: ['交大项目', '秦汉大道', '秦韵佳苑', '司法小区'],
    car: ['陕A34512', '陕A34LB3'],
    repair_type: ['日常保养', '油费', '过路费', '停车费', '轻微剐蹭', '重大维修'],
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

  repairTypeTap: function (e) {
    this.setData({
      index: e.detail.value
    })
    type_value = this.data.repair_type[e.detail.value];
  },

  startTap: function () {
    this.datetimePicker.setPicker('startDate');
  },

  repair_factoryContent: function (e) {
    this.setData({
      repair_factoryContent: e.detail.value
    })
  },

  repair_costContent: function (e) {
    this.setData({
      repair_costContent: e.detail.value
    })
  },

  commentContent: function (e) {
    this.setData({
      commentContent: e.detail.value
    })
  },

  formSubmit: function (e) {
    console.log('项目部', prj_value);
    console.log('车辆', car_value);
    console.log('维修类型', type_value);
    console.log('维修时间', this.data.startDate);
    console.log('维修工厂', this.data.repair_factoryContent);
    console.log('维修价格', this.data.repair_costContent);
    var location = wx.getStorageSync('address')
    console.log('当前位置', location);
    var openId = wx.getStorageSync('openId');
    console.log(openId);

    if (prj_value == null) {
      util.showError('项目不能为空')
    } else if (car_value == null) {
      util.showError('车辆不能为空')
    } else if (this.data.startDate == null) {
      util.showError('时间不能为空')
    } else if (this.data.repair_costContent == 0) {
      util.showError('价格不能为空')
    } else {
      wx.request({
        url: 'https://4z2dgktq.qcloud.la/weapp/repair/add',
        data: {
          prj: prj_value, carNum: car_value,
          open_id: openId,
          repair_type: type_value,
          repair_time: this.data.startDate,
          repair_factory: this.data.repair_factoryContent,
          repair_cost: this.data.repair_costContent,
          repair_location: location,
          commet: this.data.commentContent
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
