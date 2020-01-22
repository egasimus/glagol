module.exports =
  { compile:  require('./plaintext').compile
  , evaluate: function evaluate (file) { return JSON.parse(file.compiled); }
  , globals:  function globals (file) {}
  , name:     "JSON"
  , target:   "plaintext" };
