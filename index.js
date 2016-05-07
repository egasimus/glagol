var Router = module.exports = function Router (routes, handlers, default) {

  router.routes   = routes.map(Router.prepareRoute) || [];
  router.handlers = handlers                        || {};
  router.default  = default                         || Router.defaultRoute;

  return router;

  function router (input, data) {

    var result = undefined;

    if (router.routes.some(function (route, i) {
      var match = route[0];
      if (match(input, data)) {
        result = route[1](input, data);
        return true;
      }
    })) {
      return result;
    } else {
      return router.default(input, data);
    }
    
  }

}

Router.defaultRoute = function (input, data) {
  console.error('with (', data, ') no match for:', input);
}

Router.prepareRoute = function (route) {
  var newRoute = [ route[0], route[1] ];
  if (route[0] instanceof RegExp) newRoute[0] = Router.regExpMatcher(route[0]);
  if (route[0] instanceof String) newRoute[0] = Router.stringMatcher(route[0]);
  if (route[1] instanceof String) newRoute[1] = Router.handler(route[1]);
}

Router.handler = function (name) {
  return function (input, data) {
    console.info(input, 'with (', data, ') matched:', name);
    if (router.handlers[name]) {
      router.handlers[name](input, data);
    } else {
      console.warn('with (', data, ') no handler:', name);
    }
  }
}

Router.regExpMatcher = function (string) {
  return function (input) {
    input = input.trim();
    var r = new RegExp(string);
    console.debug('match', input.trim(), 'against', r, r.test(input))
    return r.test(input);
  }
}

Router.stringMatcher = function (string) {
  return function (input) {
    input = input.trim();
    console.debug('match', input, 'against', string, input === string)
    return input === string;
  }
}
