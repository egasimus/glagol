(function (App) {

  console.log(App);

  App._initialState = App.nodes.model();
  App.model = require('riko-mvc/model')(App._initialState);

  return App;

})
