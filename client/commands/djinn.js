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
    return djinn.default(input, data);
  }


}

djinn.default = function (input, data) {
  console.error('No match for', input, 'with', data);
}

djinn.handlers = {}

function handler (name) {
  return function (input, data) {
    console.log(input, 'with (', data, ') matched:', name);
    if (djinn.handlers[name]) djinn.handlers[name](input, data);
  }
}

function re (string) {
  return function (input) {
    return (new RegExp(string)).test(input);
  }
}

djinn.routes =
  [ [ re('(\d+)'),            handler('port')  ]
  , [ re('ws://(.+):(\d+)'),  handler('ws')    ]
  , [ re('wss://(.+):(\d+)'), handler('wss')   ]
  , [ re('http://(.+)'),      handler('http')  ]
  , [ re('https://(.+)'),     handler('https') ]
  , [ re('/(.+)'),            handler('root')  ]
  , [ re('~/(.+)'),           handler('home')  ] ];
