var pickerFile = require('../../libs/picker_datetime/picker_datetime.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var util = require('../../utils/util.js');
var config = require('../../utils/config.js')
const Zan = require('../../libs/dist/index');


Page(Object.assign({}, Zan.Select, Zan.Field, {
  data: {
    items: [
      {
        padding: 0,
        value: '1',
        name: '同意',
      },
      {
        padding: 0,
        value: '2',
        name: '不同意',
      },
    ],

    checked: {
      base: -1,
      color: -1,
      form: -1
    },

    activeColor: '#4b0',
    id: '',
    openid: '',
    showView: false,
  },

  onLoad: function (options) {
    console.log("options:",options);
    this.setData({
      id: options.id,
      openid: options.openid,
      prj: options.prj,
      carNum: options.carNum,
      startTime: options.startTime,
      endTime: options.endTime,
      commet:options.commet,
      destPlace: options.destPlace,
    })

    showView: (this.data.showView == "true" ? true : false)

  },

  infoContent: function (e) {
    this.setData({
      infoContent: e.detail.value
    })
  },

  handleZanSelectChange({ componentId, value }) {
    this.setData({
      [`checked.${componentId}`]: value
    });

    if (value == 2) {
      this.setData({
        showView: true
      })
    } else {
      this.setData({
        showView: false,
      })
    }
  },

  formSubmit: function (e) {
    console.log('info', e.detail.value);
    console.log('form_id', e.detail.formId);
    console.log('项目部', this.data.prj);
    console.log('车辆', this.data.carNum);
    console.log('时间值', this.data.startTime);
    console.log('时间值', this.data.endTime);
    console.log('目的地', this.data.destPlace);
    console.log('备注', e.detail.value.approvalCommet);
    console.log('审批结果', e.detail.value.result);

    var result = '';

    if (e.detail.value.result == 1) {
      result = '同意';
    } else if (e.detail.value.result == 2) {
      result = '不同意';
    } else {
      util.showError('选择审批选项');
      return;
    }

    var openId = wx.getStorageSync('openId');
    console.log(openId);

    wx.request({
      url: config.service.planStateUrl, //接口地址
      data: {
        itemid: this.data.id, state: result, openid: this.data.openid, form_id: e.detail.formId, carNum: this.data.carNum,
        startTime: this.data.startTime, approvalCommet: e.detail.value.approvalCommet
      },
      method: 'Get',
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: function (res) {
        console.log(res.data)
        util.showSuccess('审批成功');
        setTimeout(function () {
          // 要延时执行的代码
          wx.switchTab({
            url: '../index/index',
          })
        }, 1000) // 延迟时间 这里是 1 秒  
      }
    })
  }
}));
