module.exports = function apiClient (getConnection) {

  // getConnection is a function that returns a promise
  // for the current q-connection instance to be used

  function apiCall (path) {
    var args = Array.prototype.slice.call(arguments, 1)
    var connection = apiCall.getConnection();
    console.debug("api call", path, args, connection);
    return connection.then(function (connection) {
      return connection.connection.fcall(path, args) })
  }

  apiCall.getConnection = getConnection;

  return apiCall;

}
