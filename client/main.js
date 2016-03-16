(function () {
  var API = $.lib.api.init(Glagol).API
    , App = $.lib.client.init(Glagol);
  API("session/start")
  return App;
})
