module.exports =
  { compile: function compile (file) {
      return file.source.replace(/\n$/, ""); // strip trailing newline
    }
  , evaluate: function evaluate (file) {
      return file.compiled;
    }
  , globals: function globals (file) {}
  , name:   "Plaintext"
  , target: "plaintext" };
