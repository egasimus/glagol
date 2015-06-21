require('insert-css')(require('./lib/ldt/ldt.styl'));

var parser = new (require('./lib/ldt/parser.js'))(
  { whitespace: /\s+/,
    comment: /\/\/[^\r\n]*/,
    other: /\S+/ } );

var EditorWidget = module.exports = function EditorWidget (code) {
  this.code = code;
};

EditorWidget.prototype.type = "Widget";

EditorWidget.prototype.init = function () {
  this.textarea = document.createElement('textarea');
  this.textarea.classList.add("code");
  this.textarea.wrap = 'off';
  this.textarea.value = this.code;

  this.syntax    = {};
  this.decorator = new (require('./lib/ldt/textarea.js'))(this.textarea, parser);

  return this.decorator.element;
};

EditorWidget.prototype.update = function (previous, domNode) {};

EditorWidget.prototype.destroy = function (domNode) {};
