# Glagol API documentation

Last update 2016-03-06

## Loader

The loader is what takes care of all interaction with the filesystem: it
constructs instances of `File` and `Directory` based on the contents of the
given path, and then keeps them up to date with any changes to the underlying
filesystem objects.

```
Loader = require("glagol").Loader
```

Factory for loaders.

* `Loader.defaults` contains default values for some options.
* `Loader.defaults.filter(fullpath, rootpath)` is the default filter
  implementation, which says that `node_modules`, Vim's `swp` and `swo`
  tempfiles, and any dotfiles, are to be ignored and not loaded.
* `Loader.defaults.reader(location)` reads the full contents of the file at
  `location` via `fs.readFileSync`.
* `Loader.defaults.log` contains references to the default logging callbacks,
  which print colored text to the console.
* `Loader.defaults.log.added`,
* `Loader.defaults.log.changed`, and
* `Loader.defaults.log.removed`, are references to those same logging callbacks.
  They can be passed to `loader.events.off(event, cb)` to disable logging after
  the loader has already been created.

Calling `Loader` returns a loader instance.

```
loader = Loader([baseOptions])
```

Where `baseOptions` is an optional object that may contain overrides for the
following options:

* `baseOptions.filter` (default: `Loader.defaults.filter`) allows you to define
  custom rules about which files will be ignored by this loader.
* `baseOptions.reader` (default: `Loader.defaults.reader`) allows file reading
  behavior for this loader to be customized. Overriding this could allow you to
  process file contents as it first enters the Glagol pipeline; or mayhap to
  automatically return lazy proxy objects for large on-disk resources of some
  type.
* `baseOptions.log` (default: `true`) *does not* override `Loader.defaults.log`.
  This is currently a simple Boolean switch which determines whether default log
  handlers are bound or not; thus, setting it to a falsey value disables logging
  for this loader.
* `baseOptions.eager` (default: `true`) determines whether files will be re-read
  as soon as they have changed, vs. as late as they are requested. Can be set
  to `false` in order to prevent excessive re-reading of files that change often
  but are not read much.
* `baseOptions.shorthands` (default: `true`) is passed down to the `File` and
  `Directory` instances created by this loader, and determines whether the `$`,
  `_`, and `__` shorthands will be present when evaluating any JavaScript-based
  code contained therein.
* `baseOptions.formats` (default: `require('../formats/index.js')`) extends this
  loader's format index, allowing you to make Glagol aware of file extensions
  other than `.js`.
* `baseOptions` may also contain any overrides for the default `File` and
  `Directory` objects that are to be propagated to any objects created by this
  loader.

The loader instance has the following properties.

* `loader.options` contains the current configuration of this loader, as
  overridden by `baseOptions`. Currently, any changes made in `loader.options`
  during runtime are only propagated to `File` and `Directory` objects loaded
  after the changes have been made, but not to any previously loaded objects.
* `loader.options.formats` (default: `require('../formats/index.js')`) contains
  an index of file extensions and suitable handlers. Currently, this simply
  compares the last characters of the filename, and by default only recognizes
  `.js` files, handling any others as plaintext.
* `loader.events` is an `EventEmitter2` instance. It emits `added`, `changed`,
  and `removed` events when the changes to the filesystem have been reflected
  in Glagol's model of the world.
* `loader.watcher` is a `Chokidar` instance, which watches to changes in the
  filesystem structure.

Calling `loader` with the path to a file or directory on your filesystem
returns a corresponding `File` or `Directory` object.

```
file = loader('/path/to/file', [options])
dir = loader('/path/to', [options])
```

* `loader(pathToSomeFile)` returns a `File` instance populated with the
  contents of that file. The instance's `parent` property defaults to `null`.
* `loader(pathToSomeDirectory)` returns a `Directory` instance, recursively
  populated with `File` and `Directory` instances that correspond to the
  contents of that directory, as filtered by `loader.filter`...

...or perhaps by `options.filter`, as the optional `options` argument here
allows for loader options to be overridden in an even finer granularity, i.e.
for just that loader call; the `options` passed to any `File` or `Directory`
created by that call to `loader(...)`, are thus a combination of
`Loader.defaults`, `baseOptions`, and `options`, with keys in the latter
ones taking precedence.

## File

```
File = require('glagol').File
file = File(options)
file = File(name, options)
file = File(name, source)
file = require('glagol').Loader([base_options])('/path/to/file', [options])
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
* `file._sourcePath` is set by the loader and contains the absolute path to the
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
* `dir.tree` is a value tree - see "Tree" below.

The following methods are available:
* `dir.add`
* `dir.remove`
* `dir.mount`
* `dir.get`

The following non-magic attributes are part of the private API:
* `dir._glagol`
* `dir._sourcePath`, if set by the loader, contains the absolute path to the
  source directory.

## Options

## Runtimes

## Tree
