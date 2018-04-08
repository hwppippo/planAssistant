var pickerFile = require('../libs/picker_datetime/picker_datetime.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var util = require('../../utils/util.js');
var config = require('../../utils/config.js')
const Zan = require('../libs/dist/index');


Page(Object.assign({}, Zan.Select, {
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
    openid: ''
  },

  onLoad: function (options) {
    this.setData({
      id: options.id,
      openid: options.openid,
      prj: options.prj,
      carNum: options.carNum,
      startTime: options.startTime,
      endTime: options.endTime,
      destPlace: options.destPlace,
      commet: options.comment
    })
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
  },

  formSubmit: function (e) {
    console.log(e.detail.formId);
    console.log('项目部', this.data.prj);
    console.log('车辆', this.data.carNum);
    console.log('时间值', this.data.startTime);
    console.log('时间值', this.data.endTime);
    console.log('目的地', this.data.destPlace);
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
        id: this.data.id, state: result, open_id: this.data.openid, form_id: e.detail.formId, carNum: this.data.carNum,
        time: this.data.startTime
      },
      method: 'Get',
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: function (res) {
        console.log(res.data)
      }
    })
  }
}));
