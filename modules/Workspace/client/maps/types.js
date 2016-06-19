module.exports = require('riko-route')(
  [ [ 'iframe',    __.views.frames.iframe      ]
  , [ 'file',      __.__.FS.views.file         ]
  , [ 'directory', __.__.FS.views.directory    ]
  , [ 'glagol',    __.__.Inspect.views.glagol  ]
  ] );

module.exports.handler = function (match, input, data) {
  return match(data[0].frame, data[0].index);
};

module.exports.catchall = function (input, data) {
  return h('pre', { style: { padding: '0 9px' } },
    require('json-align')(data, false, 2));
};
