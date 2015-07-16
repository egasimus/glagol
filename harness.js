var %BUNDLE%;
var deps=%DEPS%;
var getRequire = (function(){
  return function getRequire(a){
    return function atomRequire(m){
      return require(deps[a][m])
    }
  }
})();
(function start (entryAtomName, ATOMS) {

  ATOMS[entryAtomName].value = require('vm').runInNewContext(
    ATOMS[entryAtomName].compiled, makeContext(entryAtomName));

  console.log(connectSocket());

  function makeContext (atomName) {
    var context =
      { require: getRequire(atomName)
      , script:  document.getElementsByTagName("script")[0] // TODO
      , deref:   deref };
    ATOMS[translate(atomName)].derefs.map(function (i) {
      context[i] = ATOMS[i];
    });
    return context;
  };

  function translate (word) {
    // TODO import whole wisp
    return word.replace(/(-[a-zA-Z])/g,
      function (x) { return x[1].toUpperCase() })
  }

  function deref (atom) {
    if (!atom.value) {
      atom.value = require('vm').runInNewContext(
        atom.compiled, makeContext(atom.name));
    }
    return atom.value;
  }

  function connectSocket () {
    var socket = new WebSocket('ws://localhost:2097/socket'); // TODO
    socket.onmessage = function (evt) {
      var data = JSON.parse(evt.data);
      console.log(data);
    }
    return socket;
  }

})("%ATOM%", %DEREFS%);
