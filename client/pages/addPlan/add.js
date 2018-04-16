var pickerFile = require('../../libs/picker_datetime/picker_datetime.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var util = require('../../utils/util.js');
const config = require('../../utils/config.js')

const Zan = require('../../libs/dist/index');

Page(Object.assign({}, Zan.Dialog, Zan.Field, {
  data: {
    config,
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    people: '',
    prjName: {},
    carName: {},
    commetValue: '',
    placeValue: '',
    startDate: '',
    endDate: '',
    prjType: '',
    carType: '',
  },

  onLoad: function () {
    this.datetimePicker = new pickerFile.pickerDatetime({
      page: this,
      animation: 'slide',
      duration: 100
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

  clearInput() {
    this.data.placeContent = ''
    this.setData({
      commet: '',
      dest: '',
      startDate: '',
      endDate: '',
      prjType: '',
      carType: ''
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
      }, {
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
        text: '陕A 67cl7',
        color: 'red',
        type: '陕A 67cl7'
      }]
    }).then(({ type }) => {
      console.log('=== dialog with vertical buttons ===', `type: ${type}`);
      this.setData({
        carType: `${type}`
      })
    });
  },

  formSubmit: function (e) {
    console.log(e.detail.formId);
    console.log('value:', e.detail.value);

    console.log('项目部', this.data.prjType);
    console.log('车辆', this.data.carType);
    console.log('时间值', this.data.startDate);
    console.log('时间值', this.data.endDate);
    console.log('人员', this.data.people);
    console.log('出车事由', e.detail.value.commet);
    console.log('目的地', e.detail.value.dest);
    console.log('当前位置', config.address);
    var openId = wx.getStorageSync('openId');
    console.log(openId);

    if (this.data.prjType == '') {
      util.showError('项目不能为空')
    } else if (this.data.carType == '') {
      util.showError('车辆不能为空')
    } else if (this.data.startDate == '' || this.data.endDate == '') {
      util.showError('时间不能为空')
    } else if (e.detail.value.commet == '') {
      util.showError('出车事由不能为空')
    } else if (e.detail.value.destPlace == '') {
      util.showError('目的地不能为空')
    } else {
      wx.request({
        url: config.service.addPlanUrl,
        data: {
          prj: this.data.prjType, carNum: this.data.carType,
          open_id: openId,
          startTime: this.data.startDate, endTime:
          this.data.endDate, user: this.data.people,
          commet: e.detail.value.commet,
          location: config.address, destPlace: e.detail.value.dest,
          form_id: e.detail.formId,
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        }, // 设置请求的 header
        success: function (res) {
          console.log(res);
          util.showSuccess('添加成功');
          wx.switchTab({
            url: '../index/index',
          })
        },
        fail: function (res) {
          console.log(res);
        }
      })
    }
  }
}));
