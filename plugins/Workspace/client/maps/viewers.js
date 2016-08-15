
module.exports = require('riko-route')(module.exports.collection);

module.exports.collection =
  [ [ /~(?:\/(.+))?/
    , function (input) {
        return h('.Launcher_Helper',
          { onclick: __.open('directory', input) },
          [ h('strong', 'open'), ' ', input ]) } ]

  , [ /\/(.*)/
    , function (input) {
        return h('.Launcher_Helper',
          { onclick: __.open('directory', input) }
          [ h('strong', 'open'), ' ', input ]) } ]

  //, [ /([0-9])/,            function (input) { _.open('glagol', 'ws://localhost:' + input) } ]

  , [ /([0-9])/,            nop('port')  ]

  , [ /ws:\/\/(.+):(\d+)/,  nop('ws')    ]

  , [ /wss:\/\/(.+):(\d+)/, nop('wss')   ]

  , [ /http:\/\/(.+)/,      nop('http')  ]

  , [ /https:\/\/(.+)/,     nop('https') ]

  ] );

function nop (op) { return function () { console.info(op, 'not implemented') } };
