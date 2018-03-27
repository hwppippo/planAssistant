// fetch.js 工具类
var config = require('./config.js');

// 腾讯地图逆向解析地址
function showAddress(latitude, longitude) {
  var that = this;
  var qqMapApi = config.qqMapApi + "?location=" + latitude + ',' +
    longitude + "&key=" + config.qqUserkey + "&get_poi=1";
  wx.request({
    url: qqMapApi,
    data: {},
    method: 'GET',
    success: (res) => {
      //console.log(res)
      if (res.statusCode == 200 && res.data.status == 0) {
        wx.setStorageSync('address', res.data.result.address);
      }
    }
  })
}

module.exports = {
  showAddress: showAddress
}