var pickerFile = require('../tools/js/picker_datetime.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var util = require('../../utils/util.js');
var config = require('../../utils/config.js')
var prj_value, car_value, type_value;

Page({
  data: {
    text: "票据",
    showView: false,
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    array: ['交大项目', '秦汉大道', '秦韵佳苑', '司法小区'],
    car: ['陕A34512', '陕A34LB3'],
    repair_type: ['日常保养', '油费', '过路费', '停车费', '违章停车', '重大维修'],
    people: '',
    invoice_photo: ''
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
    showView: (this.data.showView == "true" ? true : false)
  },

  // //切换隐藏和显示 
  // toggleBtn: function (e) {
  //   var that = this;
  //   that.setData({
  //     index: e.detail.value
  //   })
  // },

  prjTap: function (e) {
    this.setData({
      prj_index: e.detail.value
    })
    prj_value = this.data.array[e.detail.value];
  },

  carTap: function (e) {
    this.setData({
      car_index: e.detail.value
    })
    car_value = this.data.car[e.detail.value];
  },

  repairTypeTap: function (e) {
    this.setData({
      index: e.detail.value
    })
    type_value = this.data.repair_type[e.detail.value];
    // console.log('类型', type_value);
    if (type_value == "违章停车") {
      this.setData({
        showView: true
      })
    } else {
      this.setData({
        showView: false,
        deductContent: 0
      })
    }
  },

  startTap: function () {
    this.datetimePicker.setPicker('startDate');
  },

  repair_factoryContent: function (e) {
    this.setData({
      repair_factoryContent: e.detail.value
    })
  },

  repair_costContent: function (e) {
    this.setData({
      repair_costContent: e.detail.value
    })
  },

  photoTap: function (e) {
    let that = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseWxImage('album')
          } else if (res.tapIndex == 1) {
            that.chooseWxImage('camera')
          }
        }
      }
    })
  },

  chooseWxImage: function (type) {
    let that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: function (res) {
        console.log(res);
        that.setData({
          invoice: res.tempFilePaths[0],
        })
        var tempFilePaths = res.tempFilePaths[0]
        wx.uploadFile({
          url: 'https://4z2dgktq.qcloud.la/weapp/upload',
          filePath: tempFilePaths,
          name: 'file',
          formData: {
            'user': 'test'
          },
          success: function (res) {
            //do something
            var jsonStr = res.data;
            jsonStr = jsonStr.replace(" ", "");
            if (typeof jsonStr != 'object') {
              jsonStr = jsonStr.replace(/\ufeff/g, "");//重点
              var jj = JSON.parse(jsonStr);
              res.data = jj;
            }

            if (res.data.code == 0) {
              that.data.invoice_photo = res.data.data.name;
            }
          }
        })
      }
    })
  },

  //违章扣分
  deductContent: function (e) {
    this.setData({
      deductContent: e.detail.value
    })
  },

  commentContent: function (e) {
    this.setData({
      commentContent: e.detail.value
    })
  },

  formSubmit: function (e) {
    console.log('项目部', prj_value);
    console.log('车辆', car_value);
    console.log('缴费类型', type_value);
    console.log('缴费时间', this.data.startDate);
    // console.log('缴费单位', this.data.repair_factoryContent);
    console.log('费用', this.data.repair_costContent);
    console.log('扣分', this.data.deductContent);
    console.log('文件名', this.data.invoice_photo)

    var location = wx.getStorageSync('address')
    console.log('当前位置', location);
    var openId = wx.getStorageSync('openId');
    console.log(openId);

    if (prj_value == null) {
      util.showError('项目不能为空')
    } else if (car_value == null) {
      util.showError('车辆不能为空')
    } else if (this.data.startDate == null) {
      util.showError('时间不能为空')
    } else if (this.data.repair_costContent == 0) {
      util.showError('价格不能为空')
    } else {
      wx.request({
        url: 'https://4z2dgktq.qcloud.la/weapp/repair/add',
        data: {
          prj: prj_value, carNum: car_value,
          open_id: openId,
          repair_type: type_value,
          repair_time: this.data.startDate,
          repair_cost: this.data.repair_costContent,
          invoice: "https://wafer-1252931863.cos.ap-guangzhou.myqcloud.com/" + this.data.invoice_photo,
          deduct: this.data.deductContent,
          repair_location: location,
          commet: this.data.commentContent
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        }, // 设置请求的 header
        success: function (res) {
          console.log(res);
          if (res.data.code == 0) {
            util.showSuccess('添加成功')
          }
        },
        fail: function (res) {
          console.log(res);
          util.showSuccess('添加失败')
        }
      })
    }
  }
})
