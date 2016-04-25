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
  console.error('with (', data, ') no match for:', input);
}

djinn.handlers = {
  home: function (input, data) {
    $.commands.add('directory', input);
  },
  root: function (input, data) {
    $.commands.add('directory', input);
  },
  port: function (input, data) {
    $.commands.add('glagol', 'ws://localhost:' + input);
  }
}

function handler (name) {
  return function (input, data) {
    console.info(input, 'with (', data, ') matched:', name);
    if (djinn.handlers[name]) {
      djinn.handlers[name](input, data);
    } else {
      console.warn('with (', data, ') no handler:', name);
    }
  }
}

function re (string) {
  return function (input) {
    var r = new RegExp(string);
    console.debug('match', input.trim(), 'against', r, r.test(input))
    return r.test(input);
  }
}

djinn.routes =
  [ [ re('([0-9])'),          handler('port')  ]
  , [ re('ws://(.+):(\d+)'),  handler('ws')    ]
  , [ re('wss://(.+):(\d+)'), handler('wss')   ]
  , [ re('http://(.+)'),      handler('http')  ]
  , [ re('https://(.+)'),     handler('https') ]
  , [ re('/(.*)'),            handler('root')  ]
  , [ re('~(.*)'),            handler('home')  ] ];
