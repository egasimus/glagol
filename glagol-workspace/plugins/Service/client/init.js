module.exports = function (App) {

  App.Workspace.registerFrameType('serviceList',
    function () { return _.views.list.apply(null, arguments) });
  App.Workspace.registerFrameType('serviceDetail',
    function () { return _.views.detail.apply(null, arguments) });

  App.API.socket.addEventListener('open',
    function () {
      App.API('Service/GetSystemServices');
      App.API('Service/GetUserServices'); })

}
