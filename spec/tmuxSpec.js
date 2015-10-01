var tmux = require('..');

describe("tmux layout parser", function () {

  console.log(tmux, tmux.parse);

  var layouts = {
    "227x62,0,0{113x62,0,0,13,113x62,114,0,14}": {}
  };

  for (var l in layouts) {
    console.log(l);
    it('can parse ' + l, testCanParse(l));
  }

  function testCanParse(layout) {
    console.log(layout);
    return function () {
      console.log("foo");
      console.log(tmux.parse(l));
      expect(compareTrees(tmux.parse(l), layouts[l])).toBe(true);
    };
  }

  function compareTrees(a, b) {
    console.log("comparetrees", a, b)
    return false;
  }

});
