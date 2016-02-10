module.exports =
  { compile:  compile
  , evaluate: require('./javascript.js').evaluate
  , globals:  require('./javascript.js').globals };

function compile () {
  var _path = this._sourcePath || this.path;
  return require('require-like')(_path)('coffee-script').compile(
    this.source, {});
}
