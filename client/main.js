(function () {

  // TODO add to glagol pseudo-globals instead
  window.API = $.lib.api.init(Glagol).API;
  window.App = $.lib.client.init(Glagol);

  API('subscribe', update).done(function (data) {
    console.debug("subscribed to server");
    _.commands.update(data);
  });
  function update () { _.commands.update.apply(null, arguments) }

  return { API: API, App: App };

})
