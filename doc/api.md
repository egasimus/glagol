# Glagol API

## Loader

The default loader interacts with the file system. It constructs instances of
`File` and `Directory`, and updates them when the underlying filesystem objects
are changed. To get started with Glagol on the server, simply require it:

```
var glagol = require('glagol')
```

This returns a function `load(path, options)`.

* When `path` points to a file, `glagol(path)` returns a `File` instance
  populated with the contents of that file.
* When `path` points to a directory, `glagol(path)` returns a `Directory`
  instance recursively populated with `File` and `Directory` instances
  corresponding to the contents of that directory.
* In both cases, the value of `options` is passed down to each instance.
* In both cases, the resulting instances are not aware of their full paths.

For easy access, `glagol.File` and `glagol.Directory` are references to the
corresponding classes, as documented below.

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

## Options

## Runtimes

## Tree
