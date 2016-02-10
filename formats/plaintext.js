module.exports =
  { compile: compile
  , globals: globals };

function compile () {
  // strip trailing newline
  return this.source.replace(/\n$/, "");
}

function globals () {}
