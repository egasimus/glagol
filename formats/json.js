module.exports =
  { compile: function compile (file) {
      return file.source.replace(/\n$/, ""); // strip trailing newline
    }
  , evaluate: function evaluate (file) {
      return JSON.parse(file.compiled);
    }
  , globals: function globals (file) {}
  , name:   "JSON"
  , target: "plaintext" };
