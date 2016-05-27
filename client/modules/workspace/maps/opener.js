var nop = function (op) { return function () { console.info(op, 'not implemented') } };

// address opener

module.exports = require('xtend')(
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

