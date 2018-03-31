//app.js
var fetch = require('./utils/location.js');
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./utils/config.js');


App({
  onLaunch: function () {
    console.log('App Launch')
    qcloud.setLoginUrl(config.service.loginUrl);

    fetch.getAddress();
  },
})