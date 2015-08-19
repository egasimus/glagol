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

  // TODO more intelligently figure out the current script
  // document.currentScript used to work, why is it returning null now
  var container = document.getElementsByTagName("script")[0].parentElement;
  container._etude      = {};
  container._etude.atom = function(key) { return ATOMS[key] }
  container._etude.tree = null;

  var installAtom = require('tree').installAtom.bind(null, ATOMS, evaluateAtom);

  function getTreeHere (atom) {
    if (container._etude.tree) return container._etude.tree;
    var tree = {};
    Object.keys(ATOMS).map(installAtom.bind(null, tree));
    container._etude.tree = tree;
    console.log(tree);
    return tree;
  }

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

  function updateDeps (atom) {}

  function makeContext (atomName) {
    var name = translate(atomName)
      , atom = ATOMS[name];

    var context =
      { _:            getTreeHere(atom)
      , watch:        watchAtomValue
      , assoc:        require('wisp/sequence.js').assoc
      , console:      console // TODO remove
      , container:    container
      , conj:         require('wisp/sequence.js').conj
      , isEqual:      require('wisp/runtime.js').isEqual
      , log:          function () { console.log.apply(console, arguments) }
      , require:      getRequire(atomName)
      , setTimeout:   setTimeout
      , clearTimeout: clearTimeout
      , WebSocket:    WebSocket
      , XMLHttpRequest: XMLHttpRequest };

    return context;
  };

  function watchAtomValue (key, cb) { // TODO with macro
    ATOMS[key].value(cb);
  }

  function translate (word) {
    // TODO import whole wisp
    return word.replace(/(-[a-zA-Z])/g,
      function (x) { return x[1].toUpperCase() })
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
