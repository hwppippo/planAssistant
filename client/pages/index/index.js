var util = require('../../utils/util.js');
var mylogin = require('../../utils/login.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index');
var config = require('../../utils/config.js');
const Zan = require('../libs/dist/index');

Page(Object.assign({}, Zan.Dialog, {

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    cauth: 0,//默认权限
    curTargetOpenId: '',
    curTargetState: '',
    curTargetAid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.openId = wx.getStorageSync('openId');
    if (this.data.openId.length == 0) {
      this.login();
    }
  },

  onShow: function () {
    console.log('page onshow');
    //这里更新数据setData
    this.data.openId = wx.getStorageSync('openId');
    if (this.data.openId.length > 0) {
      this.getInfo(this.data.openId);
    }
  },

  newPlan: function () {
    wx.navigateTo({
      url: '../addPlan/add',
    })
  },

  getInfo: function (openid) {
    var that = this;
    wx.request({
      url: config.service.planOrderUrl, //接口地址
      data: { open_id: openid },
      method: 'Get',
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: function (res) {
        console.log(res.data.data);
        if (res.data.code != 0) {
          util.showError('没有预约');
        }
        //设置车辆展示信息
        that.setData({
          carInfoData: res.data.data,
          cauth: res.data.cauth,
        })
      }
    })
  },

  test: function (e) {
    this.setData({
      curTargetOpenId: e.currentTarget.dataset.openid,
      curTargetState: e.currentTarget.dataset.state,
      curTargetAid: e.currentTarget.dataset.aid
    })
  },

  formSubmit: function (e) {
    console.log(e.detail.formId);

    console.log(this.data.curTargetOpenId);
    console.log(this.data.curTargetState);
    console.log(this.data.curTargetAid);

    var that = this;
    if (that.data.cauth == 0) {
      util.showError('没有审批权限');
      return;
    }

    if (that.data.curTargetState == '不同意') {
      util.showError('不能进行操作');
      return;
    }

    if (that.data.curTargetState == '待审批') {
      that.showZanDialog({
        // buttonsShowVertical: true,
        buttons: [{
          text: '同意',
          color: '#3CC51F',
          type: '同意'
        }, {
          text: '不同意',
          color: 'red',
          type: '不同意'
        }, {
          text: '取消',
          type: '取消'
        }]
      }).then(({ type }) => {
        console.log('=== dialog with vertical buttons ===', `type: ${type}`);
        if (`${type}` == '取消')
          return;
        wx.request({
          url: config.service.planStateUrl, //接口地址
          data: { id: that.data.curTargetAid, state: `${type}`, open_id: that.data.curTargetOpenId, form_id: e.detail.formId},
          method: 'Get',
          header: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
          },
          success: function (res) {
            console.log(res.data)
            that.getInfo(that.data.openId);
          }
        })
      });
    } else if (that.data.curTargetState == '同意') {
      console.log('data.openId', that.data.openId);
      console.log('data.curTargetOpenid', that.data.curTargetOpenId);
      if (that.data.openId != that.data.curTargetOpenId) {
        util.showError('不能结束别人的预约');
        return;
      }
      that.showZanDialog({
        // buttonsShowVertical: true,
        buttons: [{
          text: '完成',
          color: '#3CC51F',
          type: '完成'
        }, {
          text: '取消',
          type: '取消'
        }]
      }).then(({ type }) => {
        console.log('=== dialog with vertical buttons ===', `type: ${type}`);
        if (`${type}` == '取消')
          return;
        wx.request({
          url: config.service.planStateUrl, //接口地址
          data: { id: that.data.curTargetAid, state: `${type}`, open_id: that.data.curTargetOpenId, form_id: e.detail.formId},
          method: 'Get',
          header: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
          },
          success: function (res) {
            console.log(res.data)
            that.getInfo(that.data.openId);
          }
        })
      });
    }
  },

  //切换隐藏和显示 
  toggleBtn: function (event) {
    var that = this;
    var toggleBtnVal = that.data.uhide;
    var itemId = event.currentTarget.id;
    if (toggleBtnVal == itemId) {
      that.setData({
        uhide: 0
      })
    } else {
      that.setData({
        uhide: itemId
      })
    }
  },

  login: function () {
    var that = this
    console.log('正在登陆');
    // 调用登录接口

    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
    qcloud.request({
      url: config.service.requestUrl,
      login: true,
      success(result) {
        util.showSuccess('登录成功')
        console.log('openId', result.data.data['openId']);
        //缓冲数据
        wx.setStorageSync('openId', result.data.data['openId']);
        //根据 id 号获取数据
        that.getInfo(result.data.data['openId']);
      },

      fail(error) {
        util.showModel('请求失败', error)
        console.log('request fail', error)
      }
    })
  }
}));