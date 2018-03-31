// fetch.js 工具类
var config = require('./config.js');

// 引入SDK核心类
var QQMapWX = require('./qqmap-wx-jssdk.js');

// 腾讯地图逆向解析地址
function getAddress() {
  // 实例化API核心类
  var demo = new QQMapWX({
    key: 'D3GBZ-RQT6Q-2CX53-G7S7I-RWIHO-WXFHB' // 必填
  });

  wx.getLocation({
    // type: 'gjc02', //不可用
    success: function (res) {
      // 调用接口
      demo.reverseGeocoder({
        location: {
          latitude: res.latitude,
          longitude: res.longitude
        },
        success: function (info) {
          config.address = info.result.address;
          console.log("地址:", config.address);
        },
        fail: function (info) {
          console.log(info);
        },
      });
    }, fail: function (res) {
      console.log(res);
    },
  })
}

module.exports = {
  getAddress: getAddress
}