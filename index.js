var Router = module.exports = function Router (routes, options) {

  router.prepare  = options.prepare  || default.prepare;
  router.handler  = options.handler  || default.handler;
  router.catchall = options.catchall || default.catchall;
  router.routes   = routers.map(router.prepare);
  return router;

  function router (input, data) {

    var result  = undefined
      , matched = false;

    matched = router.routes.some(function (route, i) {
      var match = route[0];
      if (match(input, data)) {
        result = router.handler(route[1], input, data);
        return true;
      }
    })

    return matcher ? result : router.catchall(input, data);
    
  }

}

Router.default =
  { prepare: function (route) {
      var newRoute = [ route[0], route[1] ];
      if (typeof route[0] === 'string') newRoute[0] = Router.stringMatcher(route[0]);
      if (route[0] instanceof RegExp)   newRoute[0] = Router.regExpMatcher(route[0]);
    }
  , handler: function (route, input, data) {
      return route(input, data);
    }
  , catchall: function (input, data) {
      console.error('with (', data, ') no match for:', input);
    }

Router.debugHandler = function (input, data) {
  console.info(input, 'with (', data, ') matched:', name);
  if (router.handlers[name]) {
    router.handlers[name](input, data);
  } else {
    console.warn('with (', data, ') no handler:', name);
  }
}

Router.regExpMatcher = function (string) {
  return function (input) {
    var r = new RegExp(string);
    console.debug('match', input.trim(), 'against', r, r.test(input))
    return r.test(input);
  }
}

Router.stringMatcher = function (string) {
  return function (input) {
    console.debug('match', input, 'against', string, input === string)
    return input === string;
  }
}
