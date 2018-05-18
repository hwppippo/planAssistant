/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://car.wzhisoft.cn';
//var host = 'http://127.0.0.1:9000';


var address = '';

var config = {
  qqMapApi: 'https://apis.map.qq.com/ws/geocoder/v1/',
  qqUserkey: 'D3GBZ-RQT6Q-2CX53-G7S7I-RWIHO-WXFHB',

  // 下面的地址配合云端 Demo 工作
  service: {
    host,

    // 登录地址，用于建立会话
    loginUrl: `${host}/login`,

    // 测试的请求地址，用于测试会话
    requestUrl: `${host}/weapp/user`,

    // 测试的信道服务地址
    tunnelUrl: `${host}/weapp/tunnel`,

    // 上传图片接口
    uploadUrl: `${host}/weapp/upload`,

    //用车列表
    planOrderUrl: `${host}/carPlans`,

    //预约用车
    addPlanUrl: `${host}/newCarPlans`,

    //删除用车
    delPlanUrl: `${host}/delCarPlans`,

    //完成用车
    planStateUrl: `${host}/doCarPlans`,

    //缴费记录
    costUrl: `${host}/carCosts`,

    //增加缴费
    addCostUrl: `${host}/newCarCosts`,

    //删除缴费
    delCostUrl: `${host}/delCarCosts`,

    //7牛 Token
    getQiniuTokenUrl: `${host}/qiniuToken`
  },
  base: {
    reason: {
      focus: true,
      title: '出车事由',
      type: 'textarea',
      placeholder: '输入出车事项'
    },
    address: {
      error: true,
      title: '目的地',
      inputType: 'textarea',
      placeholder: '输入目的地'
    },
    disabled: {
      title: '用户信息',
      disabled: true,
      value: '输入框已禁用'
    },
    excludePrice: {
      right: true,
      title: '备注',
      placeholder: '输入审批原因'
    },
  },
};

module.exports = config;