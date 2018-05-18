var pickerFile = require('../../libs/picker_datetime/picker_datetime.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var util = require('../../utils/util.js');
var config = require('../../utils/config.js')
const qiniuUploader = require("../../utils/qiniuUploader");

var prj_value, car_value, type_value;

const Zan = require('../../libs/dist/index');

Page(Object.assign({}, Zan.Dialog, {
  data: {
    text: "票据",
    showView: false,
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    people: '',
    invoice_photo: '',
    startDate: '',
    costType: '',
    prjType: '',
    carType: ''
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
    that.initQiniu();
  },


  // 初始化七牛相关参数
  initQiniu: function () {
    var options = {
      region: 'NCN', // 华北区
      uptokenURL: config.service.getQiniuTokenUrl,
      domain: 'http://p77srvwbm.bkt.clouddn.com',
      shouldUseQiniuFileName: true
    };
    qiniuUploader.init(options);
  },

  photoTap: function (e) {
    let that = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.didPressChooesImage('album')
          } else if (res.tapIndex == 1) {
            that.didPressChooesImage('camera')
          }
        }
      }
    })
  },

  didPressChooesImage: function (type) {
    var that = this;

    // 微信 API 选文件
    wx.chooseImage({
      sizeType: ['compressed'],
      sourceType: [type],
      success: function (photo) {
        var filePath = photo.tempFilePaths[0];
        that.setData({
          invoice: filePath
        });
       
        //交给七牛上传
        qiniuUploader.upload(filePath, (res) => {
          console.log(res.imageURL);
          that.setData({
            invoice_photo: res.imageURL
          });
          util.showSuccess('上传成功');
        }, (error) => {
          console.error('error: ' + JSON.stringify(error));
          util.showSuccess('上传失败');
        },
          null,// 可以使用上述参数，或者使用 null 作为参数占位符
          (progress) => {
            console.log('上传进度', progress.progress)
            console.log('已经上传的数据长度', progress.totalBytesSent)
            console.log('预期需要上传的数据总长度', progress.totalBytesExpectedToSend)
          }
        );
      }
    })
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

  selectTypeDialog() {
    this.showZanDialog({
      buttonsShowVertical: true,
      buttons: [{
        text: '日常保养',
        color: '#3CC51F',
        type: '日常保养'
      }, {
        text: '加油费',
        color: '#3CC51F',
        type: '加油费'
      }, {
        text: '过路费',
        color: '#3CC51F',
        type: '过路费'
      }, {
        text: '停车费',
        color: '#3CC51F',
        type: '停车费'
      }, {
        text: '违章缴费',
        color: '#3CC51F',
        type: '违章缴费'
      }]
    }).then(({ type }) => {
      console.log('=== dialog with vertical buttons ===', `type: ${type}`);
      this.setData({
        costType: `${type}`
      })
      if (this.data.costType == "违章缴费") {
        this.setData({
          showView: true
        })
      } else {
        this.setData({
          showView: false,
          deductContent: 0
        })
      }
    });
  },

  startTap: function () {
    this.datetimePicker.setPicker('startDate');
  },

  clearInput() {
    this.data.placeContent = ''
    this.setData({
      commet: '',
      cost: '',
      deduct: '',
      startDate: '',
      costType: '',
      prjType: '',
      carType: '',
      invoice: '',
      invoice_photo: ''
    });
  },

  formSubmit: function (e) {
    console.log(e.detail.formId);
    console.log('项目部', this.data.prjType);
    console.log('车辆', this.data.carType);
    console.log('缴费类型', this.data.costType);
    console.log('缴费时间', this.data.startDate);
    console.log('费用', e.detail.value.cost);
    console.log('扣分', e.detail.value.deduct);
    console.log('文件名', this.data.invoice_photo)

    console.log('当前位置', config.address);
    var jwt = wx.getStorageSync('jwt');
    var openId = jwt.access_token
    console.log(openId);

    if (this.data.prjType == '') {
      util.showError('项目不能为空')
    } else if (this.data.carType == '') {
      util.showError('车辆不能为空')
    } else if (this.data.startDate == '') {
      util.showError('日期不能为空')
    } else if (this.data.costContent == '') {
      util.showError('费用不能为空')
    } else if (this.data.invoice_photo == '') {
      util.showError('图片上传未完成，请等待')
    } else {
      wx.request({
        url: config.service.addCostUrl,
        data: {
          prj: this.data.prjType, carNum: this.data.carType,
          openid: openId,
          repair_type: this.data.costType,
          repair_time: this.data.startDate,
          repair_cost: e.detail.value.cost,
          invoice: this.data.invoice_photo,
          deduct: e.detail.value.deduct,
          repair_location: config.address,
          commet: e.detail.value.commet,
          form_id: e.detail.formId,
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        }, // 设置请求的 header
        success: function (res) {
          console.log(res);
          if (res.data.code == 0) {
            util.showSuccess('添加成功');
            setTimeout(function () {
              // 要延时执行的代码
              wx.switchTab({
                url: '../repair/repair',
              })
            }, 1000) // 延迟时间 这里是 1 秒 
          }
        },
        fail: function (res) {
          console.log(res);
          util.showSuccess('添加失败');
        }
      })
    }
  }
}));
