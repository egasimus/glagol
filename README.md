# Glagol 1.1.1

Glagol is a JavaScript metaframework. It enables you to build programs that can
be edited during runtime, using libraries and preprocessors of your choosing.
Glagol reloads and processes source files on demand, so you don't need to
set up a complicated build pipeline that compiles things in advance.

[![NPM](https://img.shields.io/npm/v/glagol.svg)](https://www.npmjs.com/package/glagol)
[![David](https://img.shields.io/david/egasimus/glagol.svg)](https://david-dm.org/egasimus/glagol)
[![Gitter](https://img.shields.io/badge/chat-gitter_%E2%86%92-blue.svg)](https://gitter.im/egasimus/glagol)

## In a nutshell

```
sudo npm install -g glagol
mkdir x
echo 'I am plain text, edit me!' > x/a
echo '100 * 10 // Evaluated as JavaScript' > x/b.js
echo '(function r () { console.log(_.a, _.b); setTimeout(r, _.b) })()' > x/c.js
glagol x/c.js
```

Now go ahead and edit the files `a` and `b`, and watch as the output of `c`
changes. Behind the scenes, Glagol keeps track of changes to the source code,
and, upon request, synchronously evaluates the current contents of a file and
exposes the up-to-date value via the global `_` and `__` objects (corresponding
to your filesystem's `.` and `..`, relative to the current file).

## Behind the scenes

The set of globals available in each file's context is artificially reduced.
APIs for specifying those globals, for using other
sandboxing libraries, such as [contextify](https://github.com/brianmcd/contextify),
[localify](https://github.com/edge/localify), or [sandboxed-module](https://github.com/felixge/node-sandboxed-module),
and for applying arbitrary pre-and post-processing at the source and AST levels,
will be made available in due time.

## Documentation

* [API reference](https://github.com/egasimus/glagol/blob/master/doc/api.md)
* [Changelog](https://github.com/egasimus/glagol/blob/master/CHANGELOG.md)
* [Roadmap](https://github.com/egasimus/glagol/blob/master/doc/roadmap.md)
* [License (GPL3)](https://github.com/egasimus/glagol/blob/master/LICENSE)
