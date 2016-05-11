var command = module.exports = require('riko-route')(
  [ [ /([0-9])/,            'port'  ]
  , [ /ws:\/\/(.+):(\d+)/,  'ws'    ]
  , [ /wss:\/\/(.+):(\d+)/, 'wss'   ]
  , [ /http:\/\/(.+)/,      'http'  ]
  , [ /https:\/\/(.+)/,     'https' ]
  , [ /~(?:\/(.+))?/,       'home'  ]
  , [ /\/(.*)/,             'root'  ] ] )

command.handler = function (route, input) {
  return command.handlers[route](input);
}

command.handlers =
  { home: function (input) { _.add('directory', input) }
  , root: function (input) { _.add('directory', input) }
  , port: function (input) { _.add('glagol', 'ws://localhost:' + input) } };

//command.catchall = function (input) {
  //App.Workspace('add', 'iframe', 'https://duckduckgo.com/?q=' + input);
//}
