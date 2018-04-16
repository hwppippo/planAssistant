var util = require('../../utils/util.js');
var mylogin = require('../../utils/login.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index');
var config = require('../../utils/config.js');

const { Tab, extend } = require('../../libs/dist/index');

Page(extend({}, Tab, {
  /**
   * 页面的初始数据
   */
  data: {
    tab1: {
      list: [{
        id: 'undone',
        title: '待审批'
      }, {
        id: 'done',
        title: '已审批'
      }],
      selectedId: 'undone'
    },
    openId: '',
    cauth: 0,//默认权限
    allDatas: []
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

  handleZanTabChange(e) {
    var componentId = e.componentId;
    var selectedId = e.selectedId;

    if (selectedId == 'done') {
      let doneData = [];
      for (var i in this.data.allDatas) {
        var item = this.data.allDatas[i];
        if (item.isStop != '待审批') {
          doneData.push(item);
        }
      }
      this.setData({
        carInfoData: doneData,
      });
    } else if (selectedId == 'undone') {
      let undoneData = [];
      for (var i in this.data.allDatas) {
        var item = this.data.allDatas[i];
        if (item.isStop == '待审批') {
          undoneData.push(item);
        }
      }
      this.setData({
        carInfoData: undoneData,
      });
    }
    this.setData({
      [`${componentId}.selectedId`]: selectedId
    });
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
    if (e.currentTarget.dataset.info.open_id != that.data.openId) {
      util.showError('只能删除本人信息');
      return;
    }
    if (e.currentTarget.dataset.state == '待审批') {
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
    } else {
      util.showError('已审批，不能删除，点击查看详情');
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
        that.data.allDatas = res.data.data;
        let undoneData = [];
        for (var i in that.data.allDatas) {
          var item = that.data.allDatas[i];
          if (item.isStop == '待审批') {
            undoneData.push(item);
          }
        }
        //设置车辆展示信息
        that.setData({
          carInfoData: undoneData,
          cauth: res.data.cauth,
        })
      }
    })
  },

  delInfo: function (itemid) {
    var that = this;
    // let allDatas = that.data.carInfoData;
    let newallData = [];
    var delid;
    for (var i in that.data.allDatas) {
      var item = that.data.allDatas[i];
      if (item.isStop == '待审批') {
        if (item.id != itemid) {
          newallData.push(item);
        } else {
          delid = i;
          console.log('删除:', delid);
        }
      }
    }

    // console.log("all：", newallData);

    wx.request({
      url: config.service.planDelUrl, //接口地址
      data: { id: itemid },
      method: 'Get',
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: function (res) {
        console.log(res.data);
        if (res.data.code == 0) {
          that.data.allDatas.splice(delid, 1);
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
    // 控制点击事件在 350ms 内触发，加这层判断是为了防止长按时会触发点击事件
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
          var itemId = event.currentTarget.id;
          console.log('当前信息:', event.currentTarget.dataset);
          if (event.currentTarget.dataset.state == '待审批' && that.data.cauth != 0) {
            //进入审批页面
            wx.navigateTo({
              url: '../approval/approval?prj=' + event.currentTarget.dataset.info.prj
              + '&carNum=' + event.currentTarget.dataset.info.carNum
              + '&startTime=' + event.currentTarget.dataset.info.startTime
              + '&endTime=' + event.currentTarget.dataset.info.endTime
              + '&commet=' + event.currentTarget.dataset.info.commet
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
        }, 300);
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