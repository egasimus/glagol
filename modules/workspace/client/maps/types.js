module.exports = require('riko-route')(
  [ [ 'iframe',    __.views.frames.iframe      ]
  , [ 'file',      __.__.fs.views.file         ]
  , [ 'directory', __.__.fs.views.directory    ]
  , [ 'glagol',    __.__.inspect.views.glagol  ]
  ] );

module.exports.handler = function (match, input, data) {
  return match(data.frame, data.index);
};

module.exports.catchall = function (input, data) {
  return h('pre', { style: { padding: '0 9px' } },
    require('json-align')(data, false, 2));
};
