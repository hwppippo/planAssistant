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
    //先读取缓存
    try {
      var value = wx.getStorageSync('orderlist');
      if (value) {
        // Do something with return value
        this.setData({
          carInfoData: value.data,
          cauth: value.cauth,
        })
      } else {
        this.data.openId = wx.getStorageSync('openId');
        if (this.data.openId.length > 0) {
          this.getInfo(this.data.openId);
        }
      }
    } catch (e) {
      // Do something when catch error
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
        console.log(res.data);
        if (res.data.code != 0) {
          util.showError('没有预约');
          return;
        }
        //设置缓存
        try {
          wx.setStorageSync('orderlist', res.data);
        } catch (e) {
          util.showError('缓存失败');
        }
        //设置车辆展示信息
        that.setData({
          carInfoData: res.data.data,
          cauth: res.data.cauth,
        })
      }
    })
  },

  //切换隐藏和显示 
  toggleBtn: function (event) {
    var that = this;
    var itemId = event.currentTarget.id;
    console.log('当前信息:', event.currentTarget.dataset.state);
    if (event.currentTarget.dataset.state == '待审批' && that.data.cauth != 0) {
      //进入审批页面
      wx.navigateTo({
        url: '../approval/approval?prj=' + event.currentTarget.dataset.info.prj
        + '&carNum=' + event.currentTarget.dataset.info.carNum
        + '&startTime=' + event.currentTarget.dataset.info.startTime
        + '&endTime=' + event.currentTarget.dataset.info.endTime
        + '&destPlace=' + event.currentTarget.dataset.info.destPlace
        + '&id=' + event.currentTarget.dataset.info.id
        + '&openid=' + event.currentTarget.dataset.info.open_id
      })
    } else {
      var toggleBtnVal = that.data.uhide;
      if (toggleBtnVal == itemId) {
        that.setData({
          uhide: 0
        })
      } else {
        that.setData({
          uhide: itemId
        })
      }
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