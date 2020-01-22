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

      __.readFile(state.address, function (err, data) {
        if (err) throw err;
        this.mirror.setValue(data)
      }.bind(this));

      return this.el;
    }
  , update: function (prev, el) {
      this.mirror = this.mirror || prev.mirror;
    }
  , destroy: function (el) {
    } })
