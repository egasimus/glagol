module.exports =
  { null:         require('./plaintext.js')
  , '.js':        require('./javascript.js')
  , '.esl':       require('./javascript.js')
  , '.wisp':      require('./javascript.js')
  , '.coffee':    require('./javascript.js')
  , '.litcoffee': require('./javascript.js')
  , '.styl':      require('./plaintext.js') };
