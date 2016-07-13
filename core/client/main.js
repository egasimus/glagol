Glagol.events.once('changed', _.reload(__filename));

module.exports = function main () {

  var App = {};

  App.addStyleSheet = _.addStyleSheet;

  _.moduleOrder.forEach(_.initModule(App));

  _.modules.Workspace.model.Status.set('OK'); // HACK

}
