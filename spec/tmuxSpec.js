describe("tmux layout parser", function () {

  console.log(require(".."));

  var layouts = {
    "227x62,0,0{113x62,0,0,13,113x62,114,0,14}": {}
  };

  for (var l in layouts) {
    it('can parse ' + l, testCanParse(l));
  }

  function testCanParse(layout) {
    return function () {
      expect(compareTrees(require('..').parse(l), layouts[l])).toBe(true);
    };
  }

  function compareTrees(a, b) {
    return false;
  }

});
