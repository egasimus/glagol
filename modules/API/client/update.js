module.exports = function (App) {
  return function (message) {
    var data   = JSON.parse(message.data)
      , module = data.module
    if (!module) {
      console.warn('Received data from server with no module:', data);
      return;
    }
    var update = $.modules[module].update;
    if (!update || typeof update !== 'function') {
      console.warn('Can\'t update with', data, 'because', module + '.update ' +
        'is not a function.')
      return;
    }
    update(App, data.data);
  }
}
