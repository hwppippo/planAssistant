var pickerFile = require('../libs/picker_datetime/picker_datetime.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var util = require('../../utils/util.js');
var config = require('../../utils/config.js')
var prj_value, car_value, type_value;

const Zan = require('../libs/dist/index');

Page(Object.assign({}, Zan.Dialog, {
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
        text: '陕A RT356',
        color: 'red',
        type: '陕A RT356'
      }, {
        text: '陕A 234G6',
        color: '#3CC51F',
        type: '陕A 234G6'
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
      },{
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
          url: config.service.uploadUrl,
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

  costContent: function (e) {
    this.setData({
      costContent: e.detail.value
    })
  },

  commentContent: function (e) {
    this.setData({
      commentContent: e.detail.value
    })
  },

  clearInput() {
    this.data.placeContent = ''
    this.setData({
      commetValue: '',
      deductValue: '',
      costValue:'',
      startDate: '',
      costType: '',
      prjType: '',
      carType: ''
    });
  },

  formSubmit: function (e) {
    console.log('项目部', this.data.prjType);
    console.log('车辆', this.data.carType);
    console.log('缴费类型', this.data.costType);
    console.log('缴费时间', this.data.startDate);
    // console.log('缴费单位', this.data.repair_factoryContent);
    console.log('费用', this.data.costContent);
    console.log('扣分', this.data.deductContent);
    console.log('文件名', this.data.invoice_photo)

    console.log('当前位置', config.address);
    var openId = wx.getStorageSync('openId');
    console.log(openId);

    if (this.data.prjType == null) {
      util.showError('项目不能为空')
    } else if (this.data.carType == null) {
      util.showError('车辆不能为空')
    } else if (this.data.startDate == null) {
      util.showError('时间不能为空')
    } else if (this.data.costContent == 0) {
      util.showError('价格不能为空')
    } else {
      wx.request({
        url: config.service.addCostUrl,
        data: {
          prj: this.data.prjType, carNum: this.data.carType,
          open_id: openId,
          repair_type: this.data.costType,
          repair_time: this.data.startDate,
          repair_cost: this.data.costContent,
          invoice: this.data.invoice_photo,
          deduct: this.data.deductContent,
          repair_location: config.address,
          commet: this.data.commentContent
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        }, // 设置请求的 header
        success: function (res) {
          console.log(res);
          if (res.data.code == 0) {
            util.showSuccess('添加成功');
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
