(function (App) {
  App._initialState = App.model();
  App.model = require('riko-mvc/model')(App._initialState);
  return App;
})
