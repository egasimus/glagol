var tmux = require('..');

describe("tmux layout parser", function () {

  var layouts =

    { "100x100,0,0,1":
      { width: 100, height: 100, offset: 0, wtf: 0, window: 1 }

    , "150x50,0,0{100x50,0,0,2,50x50,101,0,3}":
      { width: 150, height: 50, offset: 0, wtf: 0
      , split: "vertical", children:
        [ { width: 100, height: 50, offset: 0,   wtf: 0, window: 2 }
        , { width: 50,  height: 50, offset: 101, wtf: 0, window: 3 } ] }

    , "72x100,0,0[72x62,0,0,4,72x38,0,63,5]":
      { width: 72, height: 100, offset: 0, wtf: 0
      , split: "horizontal", children:
        [ { width: 72,  height: 62, offset: 0,   wtf: 0, window: 4 }
        , { width: 72,  height: 38, offset: 61,  wtf: 0, window: 5 } ] }

    };

  for (var l in layouts) {
    it('can parse ' + l, testCanParse(l));
  }

  function testCanParse(l) {
    return function () {
      expect(compareTrees(tmux.parse(l), layouts[l])).toBe(true);
    };
  }

  function compareTrees(a, b) {
    for (var i = 0; i < Object.keys(a).length; i++) {
      var k = Object.keys(a)[i];
      if (typeof a[k] === 'object') {
        if (typeof b[k] === 'object') {
          if (!compareTrees(a[k], b[k])) return false;
        } else {
          console.log("different type", k);
          return false;
        }
      } else {
        if (a[k] === b[k]) {
          continue;
        } else {
          console.log("different", k);
          return false;
        }
      }
    };
    return true;
  }

});
