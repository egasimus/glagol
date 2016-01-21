module.exports = function apiClient (getConnection) {

  function apiCall (path) {
    var args = Array.prototype.slice.call(arguments, 1)
    console.debug("api call", path, args)
    return apiCall.getConnection().fcall(path, args)
  }

  apiCall.getConnection = getConnection;

  return apiCall;

}
