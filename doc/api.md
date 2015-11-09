
The JavaScript code of each script is executed using `vm.createContext` and
`vm.runInContext`. Alongside the built-in globals that you automatically get
in a new `vm` context, the following globals are explicitly made available:

* `__filename`, `__dirname` are self-explanatory.
* `console` is a reference to the global `console` object.
* `process` is an object exposing the `argv`, `cwd`, `exit`, `stderr`, `stdin`,
  `stdout`, `stderr` and `versions` properties of the global `process` object.
* `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`
* `require` is an instance of [require-like](https://github.com/felixge/node-require-like)
  which resolves `require` calls relative to the script's filename.

For details, see `runtimes/javascript.js` as well as the runtime for your
language of choice.

## Loader

The loader takes care of all interaction with the filesystem: it constructs
instances of `File` and `Directory` based on the contents of the given path,
and then keeps them up to date with any changes to the underlying filesystem
objects.

* `glagol(pathToSomeFile)` returns a `File` instance populated with the
  contents of that file. The instance's `parent` property defaults to `null`.
* `glagol(pathToSomeDirectory)` returns a `Directory` instance recursively
  populated with `File` and `Directory` instances that correspond to the
  full contents of that directory. (For now, a hardcoded exception is being
  made for anything that has `node_modules` in its name; such files and
  directories are completely)

The value of `options` is simply passed down to each instance.

## File

```
var File = require('glagol').File
```

* `File.is(obj)` checks whether `obj` is an instance of `File`, i.e.
  either `obj instanceof File` is `true` *or* `obj._glagol.type` is `"File"`.

```
var file = File()
var file = File(options)
var file = File(name, options)
var file = File(name, source)
```

Using the `new` keyword when instantiating a `File` is optional.

A `File` instance has the following non-magic attributes:

* `file.name`
* `file.options`
* `file.parent` is either `null` or points to the parent `Directory`.
* `file.runtime` points to the runtime for this file. By default, this
  attribute is set automatically, depending on the filename's extension.

The following magic attributes work through getters and setters:
* `file.path`
* `file.source`
* `file.compiled`
* `file.value`

The following methods are available:
* `file.load`
* `file.compile`
* `file.evaluate`
* `file.makeContext`

The following non-magic attributes are part of the private API:
* `file._cache`
* `file._glagol`
* `file._filename` is set by the loader and contains the absolute path to the
  source file.

## Directory

```
var Directory = require('glagol').Directory
```

Using the `new` keyword when instantiating a `File` is optional.

* `Directory.is(obj)` checks whether `obj` is an instance of `Directory`, i.e.
  either `obj instanceof Directory` is `true` *or* `obj._glagol.type` is
  `"Directory"`.

```
var dir = Directory()
var dir = Directory(options)
var dir = Directory(name, options)
```

A `Directory` instance has the following non-magic attributes:
* `dir.name`
* `dir.options`
* `dir.parent` is either `null` or points to the parent `Directory`
* `dir.nodes` is an object containing child `File` and `Directory` instances,
  mapped by name.

The following methods are available:
* `dir.tree`
* `dir.descend`

The following non-magic attributes are part of the private API:
* `dir._glagol`
* `file._filename` is set by the loader and contains the absolute path to the
  source directory.

## Options

## Runtimes

## Tree
