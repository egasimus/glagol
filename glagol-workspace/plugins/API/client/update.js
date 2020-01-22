module.exports = function (App, message) {
  var data   = JSON.parse(message.data)
    , plugin = data.plugin
  if (!plugin) {
    console.warn('Received data from server with no plugin:', data);
    return;
  }
  var update = $.plugins[plugin].update;
  if (!update || typeof update !== 'function') {
    console.warn('Can\'t update with', data, 'because', plugin + '.update ' +
      'is not a function.')
    return;
  }
  update(App, data.data);
}
