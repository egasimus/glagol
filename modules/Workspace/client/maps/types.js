var collection = [];

module.exports = require('riko-route')(collection);

module.exports.collection = collection;

module.exports.handler = function (match, input, data) {
  return match(data[0].frame, data[0].index);
};

module.exports.catchall = function (input, data) {
  return h('pre', { style: { padding: '0 9px' } },
    require('json-align')(data, false, 2));
};
