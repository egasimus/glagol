module.exports = require('xtend')(
  require('riko-route')(
    [ [ 'iframe',    _.views.frames.iframe    ] 
    , [ 'file',      __.fs.views.file         ]
    , [ 'directory', __.fs.views.directory    ]
    , [ 'glagol',    __.debugger.views.glagol ]
    ] ),
  { handler: function (match, input, data) {
      return match(data.frame, data.index); } });

