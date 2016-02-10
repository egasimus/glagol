module.exports =
  { compile:  compile
  , evaluate: require('./plaintext.js').evaluate
  , globals:  globals };

function compile () {
  var _path = this._sourcePath || this.path;
  return require('require-like')(_path)('stylus').render(this.source);
}

function globals () {}
