var collection = [];

module.exports = function (value) {
  return module.exports.collection.filter(match).map(render);
  function match  (pair) { return pair[0].test(value) }
  function render (pair) { return pair[1](value)      }
}

module.exports.collection = collection =
  [ [ /~/ 
    , function () {
      return h('.Launcher_Helper',
        { onclick: __.open('directory', '~') },
        [ h('strong', 'open'), ' your home directory'])}]
  
  , [ /~(?:\/(.+))?/
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

  ];

function nop (op) { return function () { console.info(op, 'not implemented') } };
