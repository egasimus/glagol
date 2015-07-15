var %BUNDLE%;
var deps=%DEPS%;
var getRequire = (function(){
  return function getRequire(a){
    return function atomRequire(m){
      return require(deps[a][m])
    }
  }
})();
(function start (atomName, derefs) {

  var ATOMS = {};

  function makeContext (atomName) {
    console.log(document.currentScript);
    return { require: getRequire(atomName)
           , script:  document.currentScript };
  };

  var req = new XMLHttpRequest();
  req.onload = function () {
    var atoms = JSON.parse(this.responseText);
    [atomName].concat(derefs).map(function (atom) {
      ATOMS[atom] = atoms[atom];
    })
    console.log(ATOMS);
    require('vm').runInNewContext(ATOMS[atomName].compiled, makeContext(atomName));
  }
  req.open("get", "/atoms", true);
  req.send();

})("%ATOM%", %DEREFS%);
