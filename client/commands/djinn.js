var djinn = module.exports = function (input, data) {

  var result = undefined;

  if (djinn.routes.some(function (route, i) {
    var match = route[0];
    if (match(input, data)) {
      result = route[1](input, data);
      return true;
    }
  })) {
    return result;
  } else {
    return djinn.default();
  }


}

djinn.handlers = {}

function handler (name) {
  return djinn.handlers[name];
}

function re (string) {
  return new RegExp(string);
}

djinn.routes =
  [ [ re('(\d+)'),            handler('port')  ]
  , [ re('ws://(.+):(\d+)'),  handler('ws')    ]
  , [ re('wss://(.+):(\d+)'), handler('wss')   ]
  , [ re('http://(.+)'),      handler('http')  ]
  , [ re('https://(.+)'),     handler('https') ]
  , [ re('/(.+)'),            handler('root')  ]
  , [ re('~/(.+)'),           handler('home')  ] ];
