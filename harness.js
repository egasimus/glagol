var getRequire = (function(){
  var %BUNDLE%;
  var deps=%DEPS%;
  return function getRequire(a){
    return function atomRequire(m){
      return require(deps[a][m])
    }
  }
})();
(function runAtom (atomName, derefs) {
  var ATOMS = {};
  var req = new XMLHttpRequest();
  req.onload = function () {
    var atoms = JSON.parse(this.responseText);
    [atomName].concat(derefs).map(function (atom) {
      ATOMS[atom] = atoms[atom];
    })
    console.log(ATOMS);
  }
  req.open("get", "/atoms", true);
  req.send();
})("%ATOM%", %DEREFS%);
