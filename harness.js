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

  function deref (atomName) {
    console.log("deref", atomName);
    if (!ATOMS[atomName].value) {
      ATOMS[atomName].value =
        require('vm').runInNewContext(ATOMS[atomName].compiled, makeContext(atomName));
    }
    return ATOMS[atomName].value;
  }

  function makeContext (atomName) {
    var context =
      { require: getRequire(atomName)
      , script:  document.getElementsByTagName("script")[0] // TODO
      , deref:   deref };

    return context;
  };

  var req = new XMLHttpRequest();
  req.onload = function () {
    var atoms = JSON.parse(this.responseText);
    [atomName].concat(derefs).map(function (atom) {
      ATOMS[atom] = atoms[atom];
    })
    console.log(ATOMS);
    ATOMS[atomName].value =
      require('vm').runInNewContext(ATOMS[atomName].compiled, makeContext(atomName));
  }
  req.open("get", "/atoms", true);
  req.send();

})("%ATOM%", %DEREFS%);
