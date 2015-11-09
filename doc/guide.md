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

Remember `app.tree()`? `tree` is a method of `Directory` which builds a tree
out of just the `value` property of all `File` and `Directory` instances that
are contained in the parent `Directory`'s `nodes` property. To clarify, this:

```
app = Directory {
  name: ''
  nodes: {
    'alice.js': File {
      name:  'alice.js'
      value: [Getter] }
    'mad-tea-party': Directory {
      name: 'C'
      nodes: {
        'dormouse.js': File {
          name:  'dormouse.js'
          value: [Getter] }
        'mad-hatter.js': File {
          name:  'mad-hatter.js'
          value: [Getter] }
        'march-hare.js': File {
          name:  'march-hare.js'
          value: [Getter] } } } } }
```

Is transformed into this:

```
tree =
  { _:  [points to self]
    __: null
    alice: [Getter]
  , madTeaParty: {
      _:  [points to self]
      __: [points to parent]
      dormouse:  [Getter]
      madHatter: [Getter]
      marchHare: [Getter]}}
```

Attentive readers will notice a few things:

* The `_` and `__` keys suggest, and indeed correspond to, the familiar
  `.` and `..` entries that point to the current and parent directories of a
  filesystem.
* File extensions are removed and hyphens are replaced with camel case.
  This constraint is imposed in order to facilitate syntax in the form of
  `app.tree().madTeaParty.madHatter`.

Now here's the rub: when evaluating scripts, `_` and `__` are exposed as global
objects. So, when `alice.js` is executed, accessing `_.madTeaParty.madHatter`
returns the value of `mad-tea-party/mad-hatter.js`; and, conversely, from within
`mad-hatter.js`, `_.dormouse` and `__.alice` are both valid

*__TIP__: In non-JS languages where the syntax supports customization (currently
just Eslisp), this is further integrated: for example, `../alice` or
`./mad-tea-party/mad-hatter` are completely valid.*

## Wait, what?

This is the core functionality of Glagol. The minimal syntax for querying the
values of neighboring files lets you break down your program into smaller
logical units. This makes it easy for Glagol to know exactly what's changing
as you edit the source code, and reload nothing more than what's needed.

With the filesystem serving as glue for your finely modularized code, and as
long as you adhere to some basic tenets of functional programming that go a long
way towards making sure that side effects are not unnecessarily repeated, you
end up with a smooth live coding experience involving significantly fewer
restarts of the application than normally needed.

Furthermore, keeping every logical unit of code in plain sight, rather than
lumping multiple vaguely related yet disparate things into large modules that
are opaque to the ubiquitous filesystem API, expands the range of manipulations
that you can apply to your code without enlisting the help of complex
language-specific instrumentation (e.g. IDEs, preprocessing pipelines such as
Grunt or Gulp, et cetera.)
