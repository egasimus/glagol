module.exports =
  { compileSource: compileSource
  , makeContext:   require('./javascript.js').makeContext };

function compileSource () {

  var extraTransformMacros =
    (this.options.eslisp && this.options.eslisp.transform)
      ? this.options.eslisp.transform
      : [];

  try {

    return require('require-like')(this.path)('eslisp')(this.source, {
      transformMacros: [ glagolify ].concat(extraTransformMacros)
    });

  } catch (e) {

    console.log("\nCompile error (eslisp):", e.message, "\n" + JSON.stringify(e.node));

  }

}

function glagolify (token) {

  // eslisp global transform macro which
  // translates path-like syntax to regular
  // attribute access on the `_` object.

  if (token.atom && token.atom.indexOf('./') === 0) {
    return [ { atom: '.' }, { atom: '_'} ].concat(
      token.atom.split('/').slice(1).map(atom));
  }

  if (token.atom && token.atom.indexOf('../') === 0) {
    return [ { atom: '.' }, { atom: '__'} ].concat(
      token.atom.split('/').slice(1).map(atom));
  }

  if (token instanceof Array) {
    return token.map(glagolify);
  }

  return token;

  function atom (f) { return { atom: f } }

}

