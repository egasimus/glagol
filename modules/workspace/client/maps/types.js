module.exports = require('riko-route')(
  [ [ 'iframe',    __.views.frames.iframe      ]
  , [ 'file',      __.__.fs.views.file         ]
  , [ 'directory', __.__.fs.views.directory    ]
  , [ 'glagol',    __.__.debugger.views.glagol ]
  ] ),

module.exports.handler = function (match, input, data) {
  return match(data.frame, data.index);
}
