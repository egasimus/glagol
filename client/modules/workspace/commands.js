var nop = function (op) { return function () { console.info(op, 'not implemented') } };

// address opener

var Opener = require('xtend')(
  require('riko-route')(
    [ [ /~(?:\/(.+))?/,       function (input) { _.add('directory', input) } ]
    , [ /\/(.*)/,             function (input) { _.add('directory', input) } ]
    //, [ /([0-9])/,            function (input) { _.add('glagol', 'ws://localhost:' + input) } ]
    , [ /([0-9])/,            nop('port')  ]
    , [ /ws:\/\/(.+):(\d+)/,  nop('ws')    ]
    , [ /wss:\/\/(.+):(\d+)/, nop('wss')   ]
    , [ /http:\/\/(.+)/,      nop('http')  ]
    , [ /https:\/\/(.+)/,     nop('https') ]
    ] ),
  { handler: function (route, input) { return openers[route](input); } });

// hotkeys

var Keys =
  { Digit1: nop('workspace switching')
  , Digit2: nop('workspace switching')
  , Digit3: nop('workspace switching')
  , Digit4: nop('workspace switching')
  , Digit5: nop('workspace switching')

  , KeyO: function () {
      App.Model.Workspace.bars.top.input.set(['open']);
    }
  , KeyS: function () { console.log('save') }
  , KeyH: go(-1)
  , KeyJ: nop('J')
  , KeyK: nop('K')
  , KeyL: go(1)
  };

function go (by) {
  return function () {
    var Model      = App.Model.Workspace
      , frameCount = Model.frames().length
      , nextFrame  = Model.focusedFrame() + by;
    if (nextFrame < 0)           nextFrame += frameCount;
    if (nextFrame >= frameCount) nextFrame -= frameCount;
    Model.focusedFrame.set(nextFrame);
  }
}

// frame types

var Types = require('xtend')(
  require('riko-route')(
    [ [ 'iframe',    _.views.frames.iframe    ] 
    , [ 'file',      __.fs.views.file         ]
    , [ 'directory', __.fs.views.directory    ]
    , [ 'glagol',    __.debugger.views.glagol ]
    ] ),
  { handler: function (match, input, data) {
      return match(data.frame, data.index); } });

module.exports = { Opener: Opener, Keys: Keys, Types: Types };
