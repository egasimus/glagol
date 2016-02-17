module.exports = GlagolStylus;

function GlagolStylus (options) {

  var xtend     = require('xtend')
    , plaintext = require('glagol/formats/plaintext')
    , stylus    = require('stylus');

  return xtend(plaintext, { compile: compile });

  function compile (file) {
    return stylus.render(file.source, { filename: file.path });
  }

}
