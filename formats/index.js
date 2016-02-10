module.exports =
  { null:         require('./plaintext.js')
  , '.js':        require('./javascript.js')
  , '.esl':       require('./eslisp.js')
  , '.wisp':      require('./wisp.js')
  , '.coffee':    require('./coffeescript.js')
  , '.litcoffee': require('./coffeescript-literate.js')
  , '.styl':      require('./stylus.js') };
