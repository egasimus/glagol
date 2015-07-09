var create     = require('virtual-dom/create-element')
  , h          = require('virtual-dom/h')
  , renderjson = require('./lib/renderjson.js');

renderjson.set_icons('+', '-');
renderjson.set_sort_objects(true);

module.exports =
  { Editor:     Editor
  , JSONViewer: JSONViewer };

//
// Editor widget, with syntax highlighting
//

var parser = new (require('./lib/ldt/parser.js'))(
  { whitespace: /\s+/,
    comment: /\/\/[^\r\n]*/,
    other: /\S+/ } );

function Editor (code, focus) {
  this.initialContent = code;
  this.focus          = focus;
};

Editor.prototype.type = "Widget";

Editor.prototype.init = function () {
  var textarea = create(
    h('textarea.code',
      { wrap: 'off'
      , value: this.initialContent }));

  this.decorator = new (require('./lib/ldt/textarea.js'))(textarea, parser);
  this.textarea  = this.decorator.element.childNodes[1].childNodes[0];
  if (this.focus) this.textarea.classList.add('focus-me');

  return this.decorator.element;
};

Editor.prototype.update = function (previous, domNode) {
  return this.init();
};

Editor.prototype.destroy = function (domNode) {};

Editor.prototype.value = function () {
  return this.textarea.value
}

//
// Foldable JSON display widget
//

function JSONViewer (value) {
  this.value = value;
}

JSONViewer.prototype.type = "Widget";

JSONViewer.prototype.init = function () {
  this.element = renderjson(this.value);
  return this.element;
}

JSONViewer.prototype.update = function () {
  return this.init();
}

JSONViewer.prototype.destroy = function () {}
