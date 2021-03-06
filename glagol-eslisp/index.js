module.exports = GlagolEslisp;

function GlagolEslisp (options) {

  var xtend      = require('xtend')
    , javascript = require('glagol/formats/javascript')
    , eslisp     = require('eslisp');

  return xtend(javascript, { compile: compile });

  function compile (file) {
    var extraTransformMacros = options.extraTransformMacros;
    try {
      return eslisp(file.source,
        { transformMacros: [ glagolify ].concat(extraTransformMacros)});
    } catch (e) {
      if (e.node) e.message += "\n" + JSON.stringify(e.node);
      throw e;
    }
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

  if (token.type === "atom" && token.value.indexOf('/') === 0 && token.value.length > 1) {
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
