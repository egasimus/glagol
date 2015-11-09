# The Glagol Guide

To get started with Glagol on the server, simply `require` it:

```
var glagol = require('glagol')
```

`glagol` is now a `function load (path, options)`; give it the path to your
source code and it returns a `File` or `Directory`, configured with any
`options` you might have provided.

*__TIP:__ `glagol` also has the following properties:*
* *`glagol.Loader`*
* *`glagol.File`*
* *`glagol.Directory`*

*In the general case, you wouldn't need to use any of them directly.
They are constructors for the underlying components that make up Glagol.
Below you will learn how these components work, and full descriptions
can be found in the API docs.*

## Initializing a Glagol application

For example, let's say you have a source code directory, `src/`, and also the
following executable at `bin/launcher.js`:

```
#!/usr/bin/env node
app = require('glagol')(__dirname + '/../src');
```

*__TIP:__ Using `__dirname` ensures the program will work the same when launched
from any directory. If you pass just `../src`, the path will be resolved
relative to your current working directory -- which is usually not what you
want. If you're pedantic, or care about non-Unix systems, you could instead
phrase it as:*

```
app = require('glagol')(require('path').join(__dirname, '..', 'src'));
```

*Same thing.*

## Looking at Glagol from a safe distance

Let's see what `app` looks like, shall we? Add `console.log(app)`
to the launcher, and have a gander at its output:

```
Directory {
  name: '',
  nodes: {},
  options: {}
  parent: null,
  _filename: '/path/to/the/directory/called/src' }
```

Suppose you add a file called `alice.js` in `src/`:

```
console.log("Hello wonderland!")
```

When you run `bin/launcher.js` again, you will see this:

```
Directory {
  name: '',
  nodes:
   { 'alice.js':
     File {
       name:      'alice.js',
       options:   {},
       parent:    [Circular],
       runtime:   [Object],
       _cache:    [Object],
       source:    [Getter/Setter],
       compiled:  [Getter],
       value:     [Getter],
       _filename: '/path/to/the/directory/called/src/alice.js' } },
  options: {},
  parent: null,
  _filename: '/path/to/the/directory/called/src' }
```

Okay, so far so good. 

## Actually evaluating files

In order to run the code in `alice.js`, just add this to the end of
`launcher.js`:

```
app.nodes['alice.js'].value;
```

Or, equivalently:

```
app.tree().alice;
```

This is made possible thanks to the magic of JavaScript's [property getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Description).
The first time you try to access its value, the code in `alice.js` is evaluated,
and any side effects, such as printing something to the console, are executed.
The value is then cached: even if you add the above lines more than once to
your launcher, you will still get only one `Hello wonderland!` on the screen.

However, if you change `src/alice.js` (in fact, even if you just save it without
making any actual changes), Glagol's `Loader` will pick this up, and mark the
`File` object as needing update. Next time you access the value, the reloaded
code will be evaluated anew, and any side effects will be executed again.
Change `alice.js` to say `Math.random()`, and try this for a feel:

```
var fs = require('fs');
var alice = app.nodes['alice.js'];
console.log(1, alice.value);
setTimeout(function () {
  console.log(2, alice.value)
  fs.writeFileSync(alice._filename, alice.source);
  setTimeout(function () {
    console.log(3, alice.value)
  }, 1000);
}, 1000);
```

*__TIP:__ The read(-preprocess)-evaluate process happens _synchronously_ for each
file, which means loading the source code from the filesystem might become a
bottleneck in certain hypothetical scenarios. The value of the loader's
(i.e. `glagol`'s) `eager` property determines at what point the the source code
is read.*

*When `glagol.eager` is  `true` (the default), each `File` object will
initially come pre-loaded with its initial source code, and will be updated
immediately, every time a change is detected. On the other hand, after you set
`glagol.eager = false`, each `File` created by that loader will only read from
disk when needed -- that is, as soon as its `source`, `compiled`, or `value`
properties are accessed.*

*This constitutes a tradeoff: set `eager` to `true` if
you value consistent quick responsiveness and are not updating the files watched
by Glagol at outrageous rates; set it to `false` for a faster initial loading
time, but expect your program to momentarily pause to load parts of itself
as they are needed.*

## Meeting the neighbors
