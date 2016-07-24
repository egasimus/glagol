var collection =
  [ [ /audio\/.+/, 'sound'      ]
  , [ /image\/.+/, 'image'      ]
  , [ /text\/.+/,  'textEditor' ] ];

module.exports = require('riko-route')(collection);

module.exports.collection = collection;

module.exports.handler = function (match, input, data) { return match }

module.exports.catchall = function (input, data) { return null }
