var util = require('../../utils/util.js');
var mylogin = require('../../utils/login.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index');
var config = require('../../utils/config.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: ''
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
    this.getInfo(this.data.openId);
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
        console.log(res.data)
        //设置车辆展示信息
        that.setData({
          carInfoData: res.data.data,
        })
      }
    })
  },

  finishTap: function (e) {
    var that = this;
    wx.request({
      url: getApp().data.servsers + 'planOrder/state', //接口地址
      data: { id: e.currentTarget.dataset.aid },
      method: 'Get',
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: function (res) {
        console.log(res.data)
        that.getInfo(that.data.openId);
      }
    })
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
})