(function () {
  var eslisp = require('glagol-eslisp')({
    extraTransformMacros: [
      require('eslisp-dotify'),
      require('eslisp-camelify'),
      require('eslisp-propertify') ] })
  if (!global.Glagol) module.exports = eslisp;
  return eslisp;
})()
