module.exports =
  { compile: function compile (file) {
      // strip trailing newline
      return file.source.replace(/\n$/, "");
    }
  , evaluate: function evaluate (file) {
      return file.compiled;
    }
  , globals: function globals (file) {} };
