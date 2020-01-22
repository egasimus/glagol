module.exports = function apiServer (getApi) {

  apiCall.getApi = getApi;
  apiCall.delimiter = '/';

  return apiCall;

  function apiCall (path, args) {

    return new Promise(function (win, fail) {

      try {
        var api = apiCall.getApi();
      } catch (e) {
        fail("api: error getting api: " + e.message)
      }

      try {
        var split = (isFunction(apiCall.delimiter)
          ? apiCall.delimiter(path)
          : path.split(apiCall.delimiter))
      } catch (e) {
        fail("api: error parsing path " + path + ": " + e.message)
      }

      resolve(api, split);

      function resolve (branch, steps) {
        if (steps.length < 1) {
          fail("api: no path specified")
          return;
        }

        if (steps.length > 1) {
          descend(branch, steps)
          return;
        }

        var method = branch[steps[0]];
        if (method === undefined) {
          fail("api: " + path + " not found")
        }
        if (!isFunction(method)) {
          fail("api: " + path + " not a function but " + typeof method)
        }
        win(method.apply(branch, args));
      }

      function descend (branch, steps) {
        if (!exists(branch, steps[0])) {
          fail("api: " + path + " is not in the api" +
            " (starting from '" + steps[0] + "')")
          return;
        }

        var next = branch[steps[0]];
        if (!isFunction(next)) {
          resolve(next, steps.slice(1))
        } else {
          next = next();
          if (!isPromise(next)) {
            resolve(next, steps.slice(1))
          } else {
            next.then(function (val) {
              resolve(val, steps.slice(1))
            })
          }
        }
      }

    })

  }

}

function exists (branch, name) {
  return Object.keys(branch).indexOf(name) > -1
}

function isFunction (x) {
  return typeof x === "function"
}

function isObject(x) {
    return x === Object(x)
}

function isPromise(x) {
    return isObject(x) && isFunction(x.then)
}
