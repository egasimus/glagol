var h = require('virtual-dom/h');

var parser = new (require('./lib/ldt/parser.js'))(
  { whitespace: /\s+/,
    comment: /\/\/[^\r\n]*/,
    other: /\S+/ } );

var EditorWidget = module.exports = function EditorWidget (code, focus) {
  this.initialContent = code;
  this.focus          = focus;
};

EditorWidget.prototype.type = "Widget";

EditorWidget.prototype.init = function () {
  var textarea = require('virtual-dom/create-element')(h('textarea.code',
    { wrap: 'off'
    , value: this.initialContent }));

  this.decorator = new (require('./lib/ldt/textarea.js'))(textarea, parser);
  this.textarea  = this.decorator.element.childNodes[1].childNodes[0];
  if (this.focus) this.textarea.classList.add('focus-me');

  return this.decorator.element;
};

EditorWidget.prototype.update = function (previous, domNode) {
  return this.init();
};

EditorWidget.prototype.destroy = function (domNode) {};

EditorWidget.prototype.value = function () {
  return this.textarea.value
}
