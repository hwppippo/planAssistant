//app.js
var fetch = require('./utils/fetch.js');
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./utils/config.js');

App({
  data: {
    servsers: "https://4z2dgktq.qcloud.la/weapp/"
  },
  onLaunch: function () {
    console.log('App Launch')
    qcloud.setLoginUrl(config.service.loginUrl);

    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        //console.log('location:', latitude, longitude);
        fetch.showAddress.call(this, latitude, longitude) // 在需要的地方可以这样调用
      }
    })
  },
})