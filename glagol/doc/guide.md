# The Glagol Guide for Great Good

This guide assumes that you have a general familiarity with JavaScript
programming concepts, access to a command shell with Node.js and NPM installed,
and a little patience because in order to get a good grasp of how Glagol is
different from your grandma's JavaScript frameworks, we're gonna have to start
with the basics.

## Overview

Glagol works by creating an in-memory model of a directory tree, made out of
simple `File` and `Directory` models. You can create these manually in your
code, or you can use the provided `Loader` to instantiate a whole lot of them
in one go, populate them from some directory on your filesystem, and update
them as you edit the source files. And, by using [Glagol-Web](https://github.com/egasimus/glagol-web),
you can quickly set up a server that delivers pre-compiled Glagol bundles with [browserified](https://github.com/substack/node-browserify)
dependencies to the client side, retaining the live updating behavior!

  * The `Loader` recursively _reads_ the contents of a directory, and creates 
    `File` and `Directory` objects that correspond to its contents.
    - The `Loader` then _watches_ the filesystem for changes, and keeps your
      `File` and `Directory` objects always up to date as you edit the source
      files in your text editor.
  * A `File` can _contain_ either static data, or code in any language that can
    be run in a JavaScript VM.
    - A `File` is capable of _compiling_ its contents. Compilation takes a
      string of source code, optionally applies preprocessing, and returns the
      regular JavaScript value that is returned by evaluating that code.
    - Compiling is done _on-demand_: the actual _value_ of a `File` is not
      calculated until you explicitly ask for it (by referencing it in other
      code).
    - Compiling is _idempotent_: after you've gotten the value of a `File`,
      evaluation is not repeated until you _modify_ the source code (or
      explicitly _reset_ the file). Until then, you keep getting the same value,
      and you can even mutate it; any side effects involved in producing that
      value are executed only once.
  * A `Directory` is a _collection_ of other `File` and `Directory` instances.
    - A `Directory` has a _value_ which is a collection of the values of all its
      contents.
    - A `File` that is inside a `Directory` exposes the `$`, `_`, and `__`
      globals to its source code when compiling. These are _shorthands_ for
      requesting the up-to-date value of any neighboring `File` or `Directory`,
      and correspond to the path fragments `/`, `./`, and `../`.

All together now: when a `File` that is inside a `Directory` is evaluated, it
always has access to the latest value of every other `File` that are part of
the same `Directory` tree, because they are all kept up to date by the `Loader`.

Thus, you have a program that you can seamlessly edit during runtime, without
needing to reload it to see your changes. This is great for quickly putting
together Web apps, building static sites with HTML/CSS preprocessors, or
incrementally developing complex batch scripts.

You can extend Glagol, making it aware of other file types, and use it to
facilitate any task that involves processing data in a directory tree. Examples
include retrieving up-to-date metadata from a library of media files, or
automatically restarting system services whenever their configuration files
change.

## Example applications

A concrete example can often go further than an abstract explanation, however
detailed the latter may try to be. Here's a couple of apps you can take for
a spin to see the magic of Glagol in action:

* The absolute minimum you can mess around with is this [Rock, Paper, Scissors bot](github.com/egasimus/glagol-example).
* For a real-world example of a live-editable single-page Web app, complete with a
    server backend, check out [Bataka, a self-hosted anonymous imageboard](https://github.com/egasimus/bataka)
    that communicates over WebSockets and uploads media to [IPFS, the persistent Interplanetary Filesystem](https://ipfs.io/).

## Building your application with Glagol

### Launching

A simple bootstrap script that launches `src/main.js` can look like this:

```js
#!/usr/bin/env node
glagol = require('glagol')
path = require('path')
app = glagol(path.resolve(__dirname, 'src'))
app.main()
```

or, more concisely:

```js
#!/usr/bin/env node
require('glagol')(require('path').resolve(__dirname, 'src'))().main()
```

or, if you don't mind Glagol picking up files in your project's root directory
(such as `package.json`, or the launcher itself):

```js
#!/usr/bin/env node
require('glagol')(__dirname).main()
```

or you can even have your launcher and your main function in one file:

```js
#!/usr/bin/env node
!global.Glagol
  ? require('glagol')(__dirname).nodes[require('path').basename(__filename)]()()
  : (function () { /* your app starts here */ })
```

It even fits in 80 characters!

### Globals

When a piece of JavaScript code is evaluated by Glagol, it is given access to
the following global variables:

* `Glagol`: the root `Directory` (or `File`) object of the current Glagol
  instance (i.e. the value of `app` in the first bootstrapping example above)
* `$`: the _value_ of that root `Directory`
* `_`: the value of the _parent_ `Directory` of the current `File`
* `__`: the value of the parent's parent.

The value of a `Directory` is a _collection of getters_ named after each item
contained in that directory. Accessing one of these for the first time evaluates
the corresponding file and gives you the result; subsequent accesses return the
same value until the file is _changed_ (or explicitly _reset_), at which point
it is re-evaluated.

Astute readers might find a correspondence between `$` `_` `__` and the familiar
`/` `./` `../` path fragments. Indeed, in [Eslisp](https://github.com/anko/eslisp)
(and originally in [Wisp](https://github.com/Gozala/wisp), where Glagol's roots
are, though that implementation went nowhere) they are accessible as just that;
an example fragment from the code of [Etude](https://github.com/egasimus/etude)
(which is written in Eslisp) goes:

```
(/sequencer/pulse (../state/bpm) pulse)
```

Using Eslisp with Glagol gives you the elegance of Lisp with the convenience of
shell scripts. You might want to give it a try - Eslisp's basic syntax maps 1-to-1 to
JavaScript, but there's also an elegant macro system for making the language just
how you want it to be.

## Exploring Glagol

The following examples are helpful if you want to extend Glagol, or just develop
a good intuition about how it works. They assume you've started a Node.js REPL
(interactive interpreter) in a location where `require('glagol')` will be able
to find Glagol.

#### A quick note on callable objects, and factories

The _callable object_ (a standard JavaScript `Function` augmented with custom
properties) is a pattern that is used extensively by Glagol. A callable object
has a principal action that is triggered by calling it as a function; but at
the same time it contains references to options or related objects.

There's one catch: such an object can not be created by JavaScript's standard
prototypal inheritance (i.e. constructors, prototypes, and the `new` keyword).
Instead, it must be created by starting with a `Function` and then adding
properties to it one by one. That's where _factories_ come in.

A factory is similar to a _constructor_; both return a new object of some kind.
A factory, however, can not be called with the `new` keyword, and thus:

* can not be used with the `instanceof` operator (always returning `false`)
* objects created by the factory do not share a common _prototype_.

(To do type checking for `File` and `Directory` objects, the `File.is(...)`
and `Directory.is(...)` functions are provided.)

Calling `require('glagol')` returns the first such object that you will
encounter, the humble `[Function: glagol]`. It has the properties `Loader`,
`File`, `Directory`, and `Error`, which are also callable objects; and
(unlike their parent object) they also serve as _factories_.

The individual objects returned by the `Loader`, `File`, `Directory`, and
`Error` factories are also, in turn, callable objects; and these can not be
created by JavaScript's standard prototypal inheritance facilities (i.e.
constructors, prototypes, and the `new` keyword), but only in a factory -
which creates `Function` then adds properties to it like a plain object.

### Root

Calling `require('glagol')` gives you this callable object:

```js
> glagol = require('glagol')
{ [Function: load]
  Loader: { [Function: Loader] ... }
  File: { [Function: File] ... }
  Directory: { [Function: Directory] ... }
  Error: { [Function: defineError] } }
```

`glagol.Loader`, `glagol.File`, `glagol.Directory`, and `glagol.Error` are also
callable objects. Unlike their parent (which has a special purpose of its own),
they are also factories: calling them returns another level of callable objects
that are Glagol's actual building blocks. Care should be made to distinguish
between a factory, and the _instances_ that it returns:

* calling _the_ `Loader` _factory_ returns _a_ `Loader` _instance_ (a `Loader`)
* calling _a_ `Loader` loads stuff from disk and returns a `File` or `Directory`

`glagol` is a shorthand function which does one of the above depending on the
arguments that are passed to it.

* calling `glagol(options:Object)` sets `glagol.defaultLoader` to a new
  `Loader` instance, and returns that `Loader` for subsequent use. You can use
  this at the start of your application, when you want to pass a set of options
  to a global Glagol instance. Subsequent calls to this form of `glagol` just
  return the value of `glagol.defaultLoader`, ignoring any extra options.
* calling `glagol(source:String)` or `glagol(source, options:Object)` passes
  on the arguments to that same `glagol.defaultLoader`, returning the resulting
  `Directory` or `File`. If the default loader has not been created yet, it is
  created, and the options are passed to it as global defaults. The value of
  the `options` arguments in subsequent calls to this form of `glagol` are used
  as temporary overrides.

### Loader

For the majority of use cases, a `Loader` serves as the entry point to Glagol.
It is the `Loader` that reads your source code from the filesystem in one fell
swoop, creates a whole fleet of `File` and `Directory` objects that represent
your program's structure, and then automatically keeps them up to date as you
edit the source code.

If you need to create a new `Loader` instance that is separate from the default
one (usually when you want to monitor something other than your program code
with Glagol, and need a different set of options) you can get one from the
`Loader` factory:

```js
> loadData = glagol.Loader({ /* options */ })
{ [Function: load]
  /* .... */ }
```

The signature of `[Function: load]` is identical to the second form of
`[Function: glagol]`:

* `source` is a path on your filesystem, which is used as the starting point
  for the loading operation; if it points to a directory, it is recursively
  loaded into a tree of `File` and `Directory` objects; if it points to a file,
  you get a solo `File` object.
* `options` can be used to pass temporary overrides to the `Loader`'s initial
  options (which are stored in `load.options`).

> glagol('.')
{ [Function: <name of your current working directory> ]
  /* ... */ }
```

### Files

#### Creating

```js
> File = require('glagol').File
> hello = File('hello-world.js', 'console.log("Hello world!")')
{ [Function: hello-world.js]
  /* .. lots of stuff ... */ }
```

Having called upon the `File` factory function, you now have a `hello`
variable containing a `File` object. It thinks it's a function named
`hello-world.js` (good luck naming a function like that!), and contains a bit
of unevaluated JavaScript source code - the text of that timeless classic,
_"Hello, world!"_: `'console.log("Hello world!")'`.

#### Evaluating

Let's explore some of its properties:

```js
> hello.source
'console.log("Hello world!")'
> hello.value
Hello world!
undefined 
```

(If `hello.value` just blurted out the source code back at you, start over and
make sure you give the `File` a name that ends in `.js`. Otherwise Glagol will
think this is a plaintext file.)

Accessing `hello.value` evaluates the source code, executing any side effects,
and hands you the return value. In this case, `undefined`, which is what
`console.log` happens to return.

When you first created that `File`, you might have noticed that it claims to
be a `Function`. Well, yes it is, and calling it is completely equivalent to
inspecting its `value`, and is in fact the preferred convention.

```js
> hello()
undefined
> // ...wait, no "Hello world!" this time?
```

No `Hello world!` this time? What happened? Since evaluating code is costly and
may trigger side effects, Glagol makes sure execution is _idempotent_: code
is only evaluated once, and then its value is cached for subsequent reuse.
Let's reset our `File` to make it forget having ever been evaluated.

```js
> hello.reset()
{ [Function: hello-world.js] ... } // .reset() is chainable!
> hello()
Hello world!
undefined
> hello()
undefined // now it's cached again
> hello.reset()()
Hello world!
undefined
```

#### Mutating

The `value` property of a `File` is immutable: if you try to set `hello.value`
to something else, it simply won't change. _Its value_, however, can be mutable,
letting you create stateful objects that can be mutated during their lifetime,
and then re-initialized when you change the source code or call `reset`.

```js
> hello.source = '(function () { console.log("Hi again!"); return {} })()'
> hello()
Hi again!
{}
> hello.value = 42
42 // did this work?
> hello.value
{} // nope
> hello.value.answer = 42
42
> hello.value
{ answer: 42 }
> hello.reset()()
Hi again!
{}
```

Note that the new `hello.source` is wrapped in an [IIFE (immediately-invoked function expression)](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression)
so that the side effects are now completely separate from the returned value.

#### Type checking

So if you need to check whether some object is a `File`, use `File.is`:

```
> File.is(hello)
true
```

### Directories

We've seen how Glagol implements a container for executing JavaScript in an
idempotent way. But to get anywhere you'll need to bring several of these
together, which is the purpose of a `Directory`:

```js
> Directory = require('glagol').Directory
{ [Function: Directory] is: [Function] }
> root = Directory("root")
{ [Function: root]
  ... }
> root.path
"/"
> root.root === root
true
```

#### Populating

Let's populate it with our friend `hello`.

```js
> hello.parent
null
> hello.path
"hello-world.js"
> root.add(hello)
> hello.path
"/hello-world.js"
> hello.parent === root
true
> root.get("hello-world.js") === hello
true
> root.nodes
{ "hello-world.js": { [Function: hello-world.js] ...} }
```

#### Evaluating

Just like Files, Directories are callable. Invoking a `Directory` returns a
map of names to value getters. Here, `root().helloWorld` is equivalent to `hello()`;
again, the code is not evaluated until explicitly asked for.

```js
> root()
{ helloWorld: [Getter/Setter] }
> hello.reset()
> root().helloWorld
Hi again!
{}
```

Note that `hello-world.js` is translated to `helloWorld`. Glagol strips the
extension and replaces hyphenated-names with camelCasedOnes, letting you
traverse directories with dot notation. Behavior for files with the same name
and different extensions is currently undefined, so try and avoid that.

#### Deleting

To remove a `File` or `Directory` from a parent `Directory`, pass a reference to
the deleted object, or its `name`, to `remove`:

```js
> root.remove(hello)
```
-or-
```js
> root.remove("hello-world.js")
```
