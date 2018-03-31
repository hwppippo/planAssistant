var pickerFile = require('../tools/js/picker_datetime.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var util = require('../../utils/util.js');
var config = require('../../utils/config.js')
var prj_value, car_value;

const Zan = require('../../utils/dist/index');

Page(Object.assign({}, Zan.Dialog, {
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',

    array: ['交大项目', '秦汉大道', '秦韵佳苑', '司法小区'],
    car: ['陕A34512', '陕A34LB3'],
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

  startTime: function () {
    this.datetimePicker.setPicker('startDate');
  },
  endTime: function () {
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

  clearInput() {
    this.data.placeContent=''
    this.setData({
      commetValue: '',
      placeValue:'',
      startDate:'',
      endDate:'',
      prjType:'',
      carType:''
    });
  },

  selectPrjDialog() {
    this.showZanDialog({
      buttonsShowVertical: true,
      buttons: [{
        text: '交大创新港',
        color: '#3CC51F',
        type: '交大创新港'
      }, {
        text: '秦韵佳苑',
        color: '#3CC51F',
        type: '秦韵佳苑'
      }, {
          text: '司法小区',
          color: '#3CC51F',
          type: '司法小区'
      },{
        text: '秦汉大道',
        color: '#3CC51F',
        type: '秦汉大道'
      }]
    }).then(({ type }) => {
      console.log('=== dialog with vertical buttons ===', `type: ${type}`);
      this.setData({
        prjType: `${type}`
      })
    });
  },

  selectCarDialog() {
    this.showZanDialog({
      buttonsShowVertical: true,
      buttons: [{
        text: '陕A RT356',
        color: 'red',
        type: '陕A RT356'
      }, {
        text: '陕A 234G6',
        color: '#3CC51F',
        type: '陕A 234G6'
      }]
    }).then(({ type }) => {
      console.log('=== dialog with vertical buttons ===', `type: ${type}`);
      this.setData({
        carType: `${type}`
      })
    });
  },

  formSubmit: function (e) {
    console.log('项目部', this.data.prjType);
    console.log('车辆', this.data.carType);
    console.log('时间值', this.data.startDate);
    console.log('时间值', this.data.endDate);
    console.log('人员', this.data.people);
    // var location = wx.getStorageSync('address')
    console.log('当前位置', config.address);
    var openId = wx.getStorageSync('openId');
    console.log(openId);

    if (this.data.prjType == null) {
      util.showError('项目不能为空')
    } else if (this.data.carType == null) {
      util.showError('车辆不能为空')
    } else if (this.data.startDate == null || this.data.endDate == null) {
      util.showError('时间不能为空')
    } else if (this.data.placeContent.length == 0) {
      util.showError('目的地不能为空')
    } else {
      wx.request({
        url: config.service.addPlanUrl,
        data: {
          prj: this.data.prjType, carNum: this.data.carType,
          open_id: openId,
          startTime: this.data.startDate, endTime:
          this.data.endDate, user: this.data.people,
          commet: this.data.commet,
          location: config.address, destPlace: this.data.placeContent
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
}));
