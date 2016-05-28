module.exports = require('riko-route')(
  [ [ /~(?:\/(.+))?/,       function (input) { __.add('directory', input) } ]
  , [ /\/(.*)/,             function (input) { __.add('directory', input) } ]
  //, [ /([0-9])/,            function (input) { _.add('glagol', 'ws://localhost:' + input) } ]
  , [ /([0-9])/,            nop('port')  ]
  , [ /ws:\/\/(.+):(\d+)/,  nop('ws')    ]
  , [ /wss:\/\/(.+):(\d+)/, nop('wss')   ]
  , [ /http:\/\/(.+)/,      nop('http')  ]
  , [ /https:\/\/(.+)/,     nop('https') ]
  ] );

function nop (op) { return function () { console.info(op, 'not implemented') } };
