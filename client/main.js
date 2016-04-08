(function () {

  window.App = $.lib.client.init(Glagol);

  // TODO automatically add API to Glagol pseudo-globals instead of the window
  // object. The problem here is that modifying options objects is tricky; and
  // furthermore does not automatically invalidate evaluation caches.
  var API    = $.lib.api.init(Glagol)
    , socket = API.socket
    , API    = window.API = API.API;

  socket.onclose = function () { window.location.reload() }

  API('subscribe', function (data) {
    _.commands.update(data)
  }).done(function (data) {
    console.debug("subscribed to server");
    _.commands.update(data);
  });

  return {
    API: API,
    App: App
  };

})
