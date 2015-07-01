module.exports =
  { ATOMS:              ATOMS
  , USES:               USES
  , loadDirectory:      loadDirectory
  , listAtoms:          listAtoms
  , initAtoms:          initAtoms
  , initAtom:           initAtom 
  , readAtoms:          readAtoms
  , readAtom:           readAtom
  , makeAtom:           makeAtom
  , freezeAtoms:        freezeAtoms
  , freezeAtom:         freezeAtom
  , runAtom:            runAtom
  , evaluateAtom:       evaluateAtom
  , importDependencies: importDependencies
  };

var Q = require('q');
Q.longStackSupport = true;
var colors  = require('colors/safe')
  , fs      = require('fs')
  , glob    = require('glob')
  , observ  = require('observ')
  , path    = require('path')
  , runtime = require('./runtime.js')
  , url     = require('url')
  , vm      = require('vm');

var log = require('./logging.js').getLogger('engine');
var ATOMS = {}
  , USES  = [];

function loadDirectory (directory) {
  return listAtoms(directory).then(initAtoms).then(readAtoms);
    //concurrently(initAtom)).then(
    //concurrently(readAtom));
}

function listAtoms (directory) {
  return Q.Promise(function (resolve, reject) {
    log("loading atoms from", colors.green(directory));
    glob(path.join(directory, '**', '*'), {}, function (err, atoms) {
      if (err) { log(err); reject(err); }
      var names = atoms.map(path.relative.bind(null, directory)).join(" ");
      log("loaded atoms", colors.bold(names));
      resolve(atoms);
    });
  });
};

function initAtoms (atomNames) {
  return Q.allSettled(atomNames.map(function (name) {
    return initAtom(name);
  }));
}

function initAtom (name) {
  return Q.Promise(function (resolve) {
    var atom = makeAtom(name);
    ATOMS[name] = atom;
    resolve(atom);
  });
}

function readAtoms (atoms) {
  return Q.allSettled(atoms.map(function (promised) {
    return readAtom(promised.value)
  }));
}

function readAtom (atom) {
  return Q.Promise(function (resolve, reject) {
    fs.readFile(atom.name, { encoding: 'utf-8' }, function (err, source) {
      if (err) { log(err); reject(err); }
      atom.source.set(source);
      resolve(atom);
    });
  })
};

function makeAtom (name, source) {
  var atom  =
    { name:   name
    , source: observ((source || '').trim()) };

  var value = observ(undefined);
  value(function () { log('updated', atom.name) });
  atom.value = function valuePlaceholder (listener) {
    if (!listener) {
      atom.value = value;
      atom.value.set(evaluateAtomSync(atom));
      return atom.value();
    }
    return value(listener);
  }
  atom.value.set = function (v) {
    atom.value = value;
    atom.value.set(v);
  }

  return atom;
}

function freezeAtoms (noValue) {
  var snapshot = {};
  Object.keys(ATOMS).map(function (key) {
    snapshot[key] = freezeAtom(ATOMS[key], noValue);
  });
  return snapshot;
}

function freezeAtom (atom, noValue) {
  var frozen =
    { name:   atom.name
    , source: atom.source() };
  if (!noValue) frozen.value = atom.value();
  return frozen;
}

function runAtom (name) {
  return Q.Promise(function (resolve, reject) {
    if (Object.keys(ATOMS).indexOf(name) === -1) {
      reject("No atom " + name);
    };
    resolve(evaluateAtom(ATOMS[name]));
  })
}

function evaluateAtomSync (atom) {
  var compiled = runtime.compileSource(atom.source(), atom.name);
  var context = runtime.makeContext(atom.name);
  USES.map(function (use) {
    context[use] = runtime.requireWisp('./lib/'+use+'.wisp', true);
  });
  Object.keys(ATOMS).map(function (key) {
    var translated = require('wisp/backend/escodegen/writer.js').translateIdentifierWord(key.split('/')[2]);
    context[translated] = ATOMS[key];
  });
  context.__dirname = path.resolve(path.dirname(atom.name));
  var value = vm.runInContext(compiled.output.code, context, { filename: atom.name });
  if (context.error) {
    throw context.error;
  } else {
    atom.value.set(value);
    return atom;
  }
}

function evaluateAtom (atom) {
  return Q.Promise(function (resolve, reject) {
    try {
      resolve(evaluateAtomSync(atom));
    } catch (e) {
      reject(e);
    }
  });
}

function importDependencies (args) {
  // TODO ecce stopgap
  return Q.Promise(function (resolve) {
    var dependencyList = null;
    for (var i = 0; i < args.length; i++) {
      var promisedAtom = args[i];
      if (promisedAtom.value.name === '../gui/use') {
        dependencyList = promisedAtom.value;
        break;
      }
    }
    if (dependencyList) {
      evaluateAtom(dependencyList).then(function (atom) {
        USES = atom.value();
        resolve(args);
      }).done();
    } else {
      resolve(args);
    }
  });
}

