exports.Dialog = require('./dialog/index');
exports.Field = require('./field/index');
exports.Select = require('./select/index');

// 兼容老版本，在下次大版本发布时会被移除
exports.CheckLabel = require('./select/index');

const { extend } = require('./common/helper');
exports.extend = extend;
