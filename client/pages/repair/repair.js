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
    imageUrl: "http://p77srvwbm.bkt.clouddn.com/",
    loading: true,
    hasMore: false,
    page: 1,
    allDatas: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      page: 1
    })
  },

  onShow: function () {
    console.log('page onshow');
    //这里更新数据setData
    var jwt = wx.getStorageSync('jwt');
    this.data.openId = jwt.access_token
    this.getInfo(this.data.openId, this.data.page);
  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;
    that.setData({ page: 1 ,allDatas:[]})
    setTimeout(function () {
      that.getInfo(that.data.openId, that.data.page)
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1000);
  },

  onReachBottom: function () {
    this.setData({ page: this.data.page + 1 })
    console.log("上拉加载更多...." + this.data.page)
    this.getInfo(this.data.openId, this.data.page)
  },

  // 触摸开始时间
  touchStartTime: 0,
  // 触摸结束时间
  touchEndTime: 0,
  // 最后一次单击事件点击发生时间
  lastTapTime: 0,
  // 单击事件点击后要触发的函数
  lastTapTimeoutFunc: null,


  /// 按钮触摸开始触发的事件
  touchStart: function (e) {
    this.touchStartTime = e.timeStamp
  },

  /// 按钮触摸结束触发的事件
  touchEnd: function (e) {
    this.touchEndTime = e.timeStamp
  },

  /// 长按
  longTap: function (e) {
    var itemId = e.currentTarget.id;
    console.log("long tap:", itemId)
    var that = this;

    wx.showModal({
      // title: '提示',
      content: '是否要删除',
      cancelColor: '#32CD32',
      confirmColor: '#FF0000',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          //删除条目
          that.delInfo(itemId)
        }
      }
    })
  },

  newRepair: function () {
    wx.navigateTo({
      url: '../addRepair/add',
    })
  },

  previewImage: function (e) {
    var current = e.target.dataset.src;
    console.log('addr:', current);
    this.data.imagelist[0] = current;
    wx.previewImage({
      current: current,                  // 当前显示图片的 http 链接  
      urls: this.data.imagelist           // 需要预览的图片 http 链接列表  
    })
  },

  getInfo: function (openid, page) {
    var that = this;

    that.setData({
      loading: false,
      hasMore: true
    })

    wx.request({
      url: config.service.costUrl, //接口地址
      data: { access_token: openid, page: page },
      method: 'Get',
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: function (res) {
        console.log(res.data);
        //设置车辆展示信息
        let newDatas = res.data.data;
        for (var i in newDatas) {
          var item = newDatas[i];
          that.data.allDatas.push(item);
        }

        that.setData({
          carInfoData: that.data.allDatas,
          loading: true,
          hasMore: false
        })
      }
    })
  },

  delInfo: function (itemid) {
    var that = this;
    let allDatas = that.data.carInfoData;
    let newallData = [];
    for (var i in allDatas) {
      var item = allDatas[i];
      if (item.id != itemid) {
        newallData.push(item);
      }
    }

    wx.request({
      url: config.service.delCostUrl, //接口地址
      data: { itemid: itemid },
      method: 'Get',
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: function (res) {
        console.log(res.data);
        if (res.data.code == 0) {
          util.showSuccess('删除成功');
          // console.log(that.data.carInfoData);
          that.setData({
            carInfoData: newallData
          });
        } else {
          util.showSuccess('删除失败');
        }
      }
    })
  },

  //切换隐藏和显示 
  toggleBtn: function (event) {
    var that = this;
    if (that.touchEndTime - that.touchStartTime < 350) {
      // 当前点击的时间
      var currentTime = event.timeStamp
      var lastTapTime = that.lastTapTime
      // 更新最后一次点击时间
      that.lastTapTime = currentTime

      // 如果两次点击时间在 300 毫秒内，则认为是双击事件
      if (currentTime - lastTapTime > 300) {
        // 单击事件延时 300 毫秒执行，这和最初的浏览器的点击 300ms 延时有点像。
        that.lastTapTimeoutFunc = setTimeout(function () {
          console.log("tap")
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
        }, 300);
      }
    }
  }
})