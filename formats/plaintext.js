module.exports =
  { compile: function compile () {
      // strip trailing newline
      return this.source.replace(/\n$/, "");
    }
  , evaluate: function evaluate () {
      return this.compiled;
    }
  , globals: function globals () {} };
