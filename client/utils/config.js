/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://746828943.lzbplan.cn';
//var host = 'https://4z2dgktq.qcloud.la';
var address = '';

var config = {
  qqMapApi: 'https://apis.map.qq.com/ws/geocoder/v1/',
  qqUserkey: 'D3GBZ-RQT6Q-2CX53-G7S7I-RWIHO-WXFHB',

  // 下面的地址配合云端 Demo 工作
  service: {
    host,

    // 登录地址，用于建立会话
    loginUrl: `${host}/weapp/login`,

    // 测试的请求地址，用于测试会话
    requestUrl: `${host}/weapp/user`,

    // 测试的信道服务地址
    tunnelUrl: `${host}/weapp/tunnel`,

    // 上传图片接口
    uploadUrl: `${host}/weapp/upload`,

    //用车列表
    planOrderUrl: `${host}/weapp/planOrder`,

    //预约用车
    addPlanUrl: `${host}/weapp/planOrder/add`,

    //完成用车
    planStateUrl: `${host}/weapp/planOrder/state`,

    //缴费记录
    costUrl: `${host}/weapp/repair`,

    //增加缴费
    addCostUrl: `${host}/weapp/repair/add`
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