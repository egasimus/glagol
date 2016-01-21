module.exports = function apiServer (getApi) {

  function apiCall (path, args) {

    var api = apiCall.getApi();

    return new Promise(function (win, fail) {
      try {
        call(path.split(apiCall.delimiter), api)
      } catch (e) {
        fail("api: error calling " + path + ": " + e.message)
      }

      function call (pathSteps, apiBranch) {
        if (pathSteps.length < 1) {
          fail("api: no path specified")
        } else if (pathSteps.length > 1) {
          if (Object.keys(apiBranch).indexOf(pathSteps[0]) > -1) {
            return call(pathSteps.slice(1), apiBranch[pathSteps[0]])
          } else {
            fail("api: " + path + " is not in the api")
          }
        } else {
          if (apiBranch[pathSteps[0]] instanceof Function) {
            win(apiBranch[pathSteps[0]].apply(apiBranch, args))
          } else {
            fail("api: " + path + " is not in the api")
          }
        }
      }
    })

  }

  apiCall.getApi = getApi;
  apiCall.delimiter = '/';

  return apiCall;

}
