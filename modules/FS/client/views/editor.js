module.exports = function (state) {
  return require('vdom-thunk')(module.exports.widget, state)
}

module.exports.widget = require('virtual-widget')(
  { init: function (state) {
      this.state = state;
      this.el = document.createElement('div');
      this.el.className = 'SourceEditor';
      this.el.appendChild(document.createElement('textarea'))
      this.el.firstChild.value = state.source;

      document.body.appendChild(this.el);
      this.mirror = require('codemirror').fromTextArea(
        this.el.firstChild,
        { viewportMargin: Infinity 
        , lineNumbers: true });
      document.body.removeChild(this.el);

      var request = new XMLHttpRequest()
        , src     = '/file?path=' + state
      request.open('GET', src, true);
      request.onload = function () {
        this.mirror.setValue(request.response);
      }.bind(this);
      request.send();

      return this.el;
    }
  , update: function (prev, el) {
      this.mirror = this.mirror || prev.mirror;
    }
  , destroy: function (el) {
    } })
