var util = require('../../utils/util.js');
var mylogin = require('../../utils/login.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index');
var config = require('../../utils/config.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    imagelist: [],
    imageUrl: "https://wafer-1252931863.cos.ap-guangzhou.myqcloud.com/",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  onShow: function () {
    console.log('page onshow');
    //这里更新数据setData
    this.data.openId = wx.getStorageSync('openId');
    this.getInfo(this.data.openId);
  },

  newRepair: function () {
    wx.navigateTo({
      url: '../addRepair/add',
    })
  },

  previewImage: function (e) {
    var current = e.target.dataset.src;
    console.log('addr:', current);
    this.data.imagelist[0] = this.data.imageUrl + current;
    wx.previewImage({
      current: current,                  // 当前显示图片的 http 链接  
      urls: this.data.imagelist           // 需要预览的图片 http 链接列表  
    })
  },

  getInfo: function (openid) {
    var that = this;
    wx.request({
      url: config.service.costUrl, //接口地址
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
})