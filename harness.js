var %BUNDLE%;
var deps=%DEPS%;
var getRequire = (function(){
  return function getRequire(a){
    return function atomRequire(m){
      return require(deps[a][m])
    }
  }
})();
(function start (entryAtomName, derefs) {

  var ATOMS = {};

  function deref (atom) {
    console.log("deref", atom);
    if (!atom.value) {
      atom.value = require('vm').runInNewContext(
        atom.compiled, makeContext(atom.name));
    }
    return atom.value;
  }

  function makeContext (atomName) {
    console.log("ctx", atomName, ATOMS[atomName].derefs);
    var context =
      { require: getRequire(atomName)
      , script:  document.getElementsByTagName("script")[0] // TODO
      , deref:   deref };
    ATOMS[atomName].derefs.map(function (i) {
      context[i] = ATOMS[i];
    });
    console.log(context);
    return context;
  };

  var req = new XMLHttpRequest();
  req.onload = function () {
    var atoms = JSON.parse(this.responseText);
    [entryAtomName].concat(derefs).map(function (atom) {
      ATOMS[atom] = atoms[atom];
    })
    console.log(ATOMS);
    ATOMS[entryAtomName].value = require('vm').runInNewContext(
      ATOMS[entryAtomName].compiled, makeContext(entryAtomName));
  }
  req.open("get", "/atoms", true);
  req.send();

})("%ATOM%", %DEREFS%);
