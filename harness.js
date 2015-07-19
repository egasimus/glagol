;var getRequire = (function(){
  return function getRequire(a){
    return function atomRequire(m){
      return require(deps[a][m])
    }
  }
})();
(function start (entryAtomName, ATOMS) {

  window.atom = function(key) { return ATOMS[key] }

  var container = document.getElementsByTagName("script")[0].parentElement // TODO

  var DEREFS = {};

  evaluateAtom(ATOMS[entryAtomName]);
  connectSocket();

  function evaluateAtom (atom) {
    console.log("evaluate", atom.name);
    var val = require('vm').runInNewContext(atom.compiled, makeContext(atom.name));
    if (atom.value) {
      atom.value.set(val)
    } else {
      atom.value = require('observ')(val);
      updateDeps(atom);
    }
    return val;
  }

  function updateDeps (atom) {
    //(DEREFS[atom.name] || []).map(function (i) { evaluateAtom(ATOMS[translate(i)]) })
  }

  function makeContext (atomName) {
    var context =
      { assoc:        require('wisp/sequence.js').assoc
      , console:      console
      , container:    container
      , deref:        deref.bind(null, ATOMS[translate(atomName)])
      , isEqual:      require('wisp/runtime.js').isEqual
      , require:      getRequire(atomName)
      , setTimeout:   setTimeout
      , clearTimeout: clearTimeout
      , XMLHttpRequest: XMLHttpRequest};
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

  function deref (from, to) {

    // keep track of interdependencies
    DEREFS[to.name] = DEREFS[to.name] || [];
    if (DEREFS[to.name].indexOf(from.name) === -1) {
      DEREFS[to.name].push(from.name);
    }

    // evaluate atom if not evaluated yet
    if (!to.value) {
      evaluateAtom(to);
    }
    return to.value();

  }

  function connectSocket () {

    var socket = new WebSocket('ws://localhost:2097/socket'); // TODO

    socket.onmessage = function (evt) {

      var data =
            JSON.parse(evt.data)
        , atom =
            (data.arg && data.arg.name)
              ? ATOMS[translate(data.arg.name)]
              : null;

      if (data.event === "atom.updated.source") {
        atom.source = data.arg.source;
      }

      else if (data.event === "atom.updated.compiled") {
        atom.compiled = data.arg.compiled;
        if (atom.value) {
          evaluateAtom(atom);
        }
      }

      else console.log(data);

    }

    return socket;

  }

})("%ENTRY%", %ATOMS%);
