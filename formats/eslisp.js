module.exports = require('xtend')(require('./javascript'), { compile: compile });

function compile (file) {

  var extraTransformMacros =
    (file.options.eslisp && file.options.eslisp.transform)
      ? file.options.eslisp.transform
      : [];

  try {

    var _path = file._sourcePath || file.path;
    return require('require-like')(_path)('eslisp')(file.source,
      { transformMacros: [ glagolify ].concat(extraTransformMacros)});

  } catch (e) {

    if (e.node) e.message += "\n" + JSON.stringify(e.node);
    throw e;

  }

}

function glagolify (token) {

  // eslisp global transform macro which
  // translates path-like syntax to regular
  // attribute access on the `_` object.

  if (token.type === "list") {
    token.values = token.values.map(glagolify);
    return token;
  }

  if (token.type === "atom" && token.value.indexOf('/') === 0) {
    return {
      type:     'list',
      location: token.location,
      values: [
        { type: 'atom', value: '.' },
        { type: 'atom', value: '$' },
      ].concat(token.value.split('/').slice(1).map(atomize))
    }
  }

  if (token.type === "atom" && token.value.indexOf('./') === 0) {
    return {
      type:     'list',
      location: token.location,
      values: [
        { type: 'atom', value: '.' },
        { type: 'atom', value: '_' },
      ].concat(token.value.split('/').slice(1).map(atomize))
    }
  }

  if (token.type === "atom" && token.value.indexOf('../') === 0) {
    return {
      type:     'list',
      location: token.location,
      values: [
        { type: 'atom', value: '.'  },
        { type: 'atom', value: '__' },
      ].concat(token.value.split('/').slice(1).map(atomize))
    }
  }

  return token;

  function atomize (f) {
    return { type: 'atom', value: f === '..' ? '__' : f === '.' ? '_' : f }
  }

}

