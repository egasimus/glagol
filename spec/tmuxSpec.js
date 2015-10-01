var tmux = require('..');

describe("tmux layout parser", function () {

  var layouts =
    { "227x62,0,0{113x62,0,0,13,113x62,114,0,14}":
      { width: 227, height: 62, offset: 0, wtf: 0
      , split: "vertical", children:
        [ { width: 113, height: 62, offset: 0,   wtf: 0, window: 13 }
        , { width: 113, height: 62, offset: 114, wtf: 0, window: 14 } ] }
    };

  for (var l in layouts) {
    it('can parse ' + l, testCanParse(l));
  }

  function testCanParse(layout) {
    return function () {
      expect(compareTrees(tmux.parse(l), layouts[l])).toBe(true);
    };
  }

  function compareTrees(a, b) {
    return !Object.keys(a).some(function (i) {
      if (typeof a[i] === 'object') {
        if (typeof b[i] === 'object') {
          compareTrees(a[i], b[i]);
        } else {
          return true;
        }
      } else {
        if (a[i] === b[i]) {
          return false;
        } else {
          return true;
        }
      }
    });
  }

});
