(function () {

  window.App = $.lib.client.init(Glagol);

  // TODO add to glagol pseudo-globals insA
  var API = $.lib.api.init(Glagol)
    , socket = API.socket
    , API = window.API = API.API;
  socket.onclose = function () { window.location.reload() }
  API('subscribe', update).done(function (data) {
    console.debug("subscribed to server");
    _.commands.update(data);
  });
  function update () { _.commands.update.apply(null, arguments) }

  return { API: API, App: App };

})
