;var getRequire = (function(){
  return function getRequire(a){
    return function atomRequire(m){
      return require(deps[a][m])
    }
  }
})();
(function start (entryAtomName, ATOMS) {

  console.log("Starting with", entryAtomName, ATOMS);

  Object.keys(ATOMS).map(function (i) {
    if (ATOMS[i].value) ATOMS[i].value = require('observ')(ATOMS[i].value);
  })

  window.atom = function(key) { return ATOMS[key] }

  // TODO ?
  var container = document.getElementsByTagName("script")[0].parentElement;

  var DEREFS = {};

  evaluateAtom(ATOMS[entryAtomName]);
  connectSocket();

  function evaluateAtom (atom) {
    var val = require('vm').runInNewContext(
      atom.compiled, makeContext(atom.name));
    if (atom.value) {
      atom.value.set(val)
    } else {
      atom.value = require('observ')(val);
      updateDeps(atom);
    }
    return val;
  }

  function updateDeps (atom) {
    //(DEREFS[atom.name] || []).map(function (i) {
    //  evaluateAtom(ATOMS[translate(i)]) })
  }

  function makeContext (atomName) {
    var name = translate(atomName)
      , atom = ATOMS[name];

    var context =
      { _:            getTreeHere(atom)
      , assoc:        require('wisp/sequence.js').assoc
      , console:      console // TODO remove
      , container:    container
      , conj:         require('wisp/sequence.js').conj
      , deref:        deref.bind(null, atom)
      , isEqual:      require('wisp/runtime.js').isEqual
      , log:          function () { console.log.apply(console, arguments) }
      , require:      getRequire(atomName)
      , setTimeout:   setTimeout
      , clearTimeout: clearTimeout
      , WebSocket:    WebSocket
      , XMLHttpRequest: XMLHttpRequest };

    atom.derefs.map(function (i) { context[i] = ATOMS[i]; });
    return context;
  };

  function getTreeHere (atom) {
    console.log("gettreehere", atom);
    var tree = {};
    Object.keys(ATOMS).map(function (key) {
      console.log(ATOMS);
      var atom = ATOMS[key];
      console.log(atom.path);
    });
    return tree;
  }

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

    // evaluate atom, and attach a listener to its value
    if (!to.value) {
      var attach = !to.value;
      evaluateAtom(to);
      if (attach) { to.value(evaluateAtom.bind(null, from)); }
    }
    return to.value();

  }

  function connectSocket () {

    var socket = new WebSocket('ws://' + window.location.host + '/socket');

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
