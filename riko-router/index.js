var Router = module.exports = function Router (routes, options) {

  options = options || {};
  router.prepare  = options.prepare  || Router.default.prepare;
  router.handler  = options.handler  || Router.default.handler;
  router.catchall = options.catchall || Router.default.catchall;
  router.routes   = routes;
  return router;

  function router (input) {

    var result  = undefined
      , matched = false
      , args    = Array.prototype.slice.call(arguments, 1);

    matched = router.routes.map(router.prepare).some(function (route, i) {
      var check = route[0];
      if (check.apply(null, [input].concat(args))) {
        result = router.handler(route[1], input, args);
        return true;
      }
    })

    return matched ? result : router.catchall(input, args);
    
  }

}

Router.default =
  { prepare: function (route) {
      var newRoute =
        [ 'string' === typeof route[0]
            ? Router.stringMatcher(route[0])
        : 'RegExp' === route[0].constructor.name
            ? Router.regExpMatcher(route[0])
        : route[0]
        , route[1] ];
      return newRoute;
    }
  , handler: function (route, input, args) {
      return route.apply(null, [input].concat(args || []));
    }
  , catchall: function (input, args) {
      console.error('with (', args, ') no match for:', input);
    }
  };

Router.debugHandler = function (input, args) {
  debug(input, 'with (', args, ') matched:', name);
  if (router.handlers[name]) {
    router.handlers[name](input, args);
  } else {
    console.warn('with (', args, ') no handler:', name);
  }
}

Router.regExpMatcher = function (string) {
  return function (input) {
    var r = new RegExp(string);
    debug('match', input.trim(), 'against', r, r.test(input))
    return r.test(input);
  }
}

Router.stringMatcher = function (string) {
  return function (input) {
    debug('match', input, 'against', string, input === string)
    return input === string;
  }
}

function debug () {
  return;
  if (console.debug) {
    console.debug.apply(console, arguments)
  } else if (console.log) {
    console.log.apply(console, arguments);
  }
}
