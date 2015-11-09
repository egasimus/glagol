# The Glagol Guide

To get started with Glagol on the server, simply `require` it:

```
var glagol = require('glagol')
```

`glagol` is now a `function load (path, options)`; pass it the path to your
source code and it returns a `File` or `Directory`, configured with any
`options` you might have provided.

`glagol` also has the following properties:
* `glagol.Loader`
* `glagol.File`
* `glagol.Directory`

In the general scenario, you wouldn't need to use any of those directly.
They are constructors for the underlying components that make up Glagol;
a description of how they work is provided in the API docs.

# Creating an application

For example, let's say you have some code in `src/` and this executable at
`bin/launcher.js`:

```
#!/usr/bin/env node
app = require('glagol')(__dirname + '/../src');
```

Using `__dirname` ensures the program will work the same when launched from
any directory. If you pass just `../src`, the path will be resolved relative to
your current working directory -- which is usually not what you want. If you're
pedantic, or care about non-Unix systems, you could instead phrase it as:

```
app = require('glagol')(require('path').join(__dirname, '..', 'src'));
```

Same thing. Let's see what `app` looks like, shall we? Add `console.log(app)`
to the launcher, and have a gander:

```
Directory {
  name: '',
  nodes: {},
  options: {}
  parent: null,
  _filename: '/path/to/the/directory/called/src' }
```

Okay, so far so good.

## Running a script; what it looks like; what it sees

Picture this: you have the setup from the above example, and then you add a
file called `alice.js` in `src/`:

```
console.log("Hello wonderland!")
```

Let's first see how it looks on the outside:

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

Nothing surprising. Now how do we run this code you say? Well, just add this to
the launcher:

```
app.nodes['alice.js'].value;
```

--or, alternatively--

```
app.tree().alice;
```

This works thanks to the magic of JavaScript's [property getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Description).
The first time you try to access its value, the code in `alice.js` is evaluated,
and any side effects, such as printing something to the console, are executed.

The value is then cached: even if you type `app.tree().alice` a few more times,
you will still get only one `Hello wonderland!` printed to the screen.

However, if you change `src/alice.js` (in fact, even if you just save it without
making any changes), Glagol's `Loader` immediately picks this up and marks the
`File` object as needing update. Next time you access the value, the code will
be evaluated anew, executing any side effects.
