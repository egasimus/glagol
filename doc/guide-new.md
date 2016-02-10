# The Glagol Guide for Great Good

This guide assumes that you have a general familiarity with JavaScript
programming concepts, access to a command shell with Node.js and NPM installed,
and a little patience because in order to get a good grasp of how Glagol is
different from your grandma's JavaScript frameworks, we're gonna have to start
with the basics.

## Overview

Glagol works by creating an in-memory model of a directory tree, made out of
simple `File` and `Directory` models; which you can create manually in your
code, or you can use a `Loader` to instantiate a whole lot of them in one
go out of an actual directory on your filesystem.

  * The `Loader` reads the contents of an actual directory on your filesystem,
    and creates `File` and `Directory` objects that correspond to its contents.
    - The `Loader` watches the filesystem for changes, and keeps your `File`
      and `Directory` objects always up to date as you edit the source files in
      your text editor.
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
  * A `Directory` is a collection of other `File` and `Directory` instances.
    - A `Directory` has a value which is a collection of the values of all its
      contents.
    - A `File` that is inside a `Directory` exposes the `$`, `_`, and `__`
      globals to its source code when compiling. These are shorthands for
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

## Exploring Glagol

### Files

#### Creating

Having installed Glagol with `npm install glagol`, then `node` and type:

```js
> File = require('glagol').File
> hello = File('hello-world.js', 'console.log("Hello world!")')
{ [Function: hello-world.js]
  /* .. lots of stuff ... */ }
```

Having called upon the `File` _factory function_, you now have a `hello`
variable containing a `File` object. It's thinks its name is `hello-world.js`,
and contains a bit of unevaluated JavaScript source code - the text of the
timeless classic "Hello, world!": `'console.log("Hello world!")'`.

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
> // ...what?!
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
```

#### Mutating

The `value` property of a `File` is immutable: if you try to set `hello.value`
to something else, it won't change. _Its value_, however, can be mutable,
letting you create stateful objects that can be mutated during their lifetime,
and then re-initialized when you change the source code or call `reset`.

```js
> hello.source = "(function () { console.log("Hi again!"); return {} })()"
> hello()
Hi again!
{}
> hello.value = 42
> hello()
{}
> hello()
{}
> hello().answer = 42
42
> hello()
{ answer: 42 }
> hello.reset()
> hello()
Hi again!
{}
```

Note that the new `hello.source` is wrapped in an [IIFE (immediately-invoked function expression)](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression)
so that the side effects are now completely separate from the returned value.

#### Objects as first-class functions

Again, how come `File` objects think they're functions? Because they are. But
isn't that a weird thing to do? Well, one nice thing that JavaScript actually
lets you do is augment a `Function` object with custom properties, just like
you would do with any other `Object`. The converse, however, seems impossible:
you can't make a callable object unless you start out with a `Function`. (Or I
haven't been able to, anyway.)

When you go down that road, though, you have to give up on JavaScript's
prototypal inheritance: your function-like objects are forever stuck with the
prototype of a `Function`, otherwise they're not callable any more. This is why
`File` itself is actually a _factory_ rather than a _constructor_: `new File()`
throws an error message; and `hello instanceof File` returns `false`.

#### Type checking

So if you need to check whether some object is a `File`, use `File.is`:

```
> File.is(hello)
true
```

The same principles holds true for the rest of Glagol's facilities.

### Directories

We've seen how Glagol implements a container for executing JavaScript in an
idempotent way. But to get anywhere you'll need to bring several of these
together, and to do that you use a `Directory`:

```js
> Directory = require('glagol').Directory
{ [Function: Directory] is: [Function] }
> root = Directory("root")
{ [Function: root]
  ... }
> root.path
"/"
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
map of names to value getters. Here, `root().hello` is equivalent to `hello()`;
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

To remove a `File` from a `Directory`, pass it or its name to `delete`:

```js
> root.delete("hello-world.js")
```
-or-
```
> root.delete(hello)
```

## Building an actual program

Having introduced the primitives of Glagol, it is time to look at an example
program. You could write it as 6 files and 2 directories, and use the `Loader`,
or you could just paste it into your Node.js session.

```js
root = Directory()

choices = Directory("choices")
rock = File("rock", "Rock")
paper = File("paper", "Paper")
scissors = File("scissors", "Scissors")
root.add(choices.add(rock).add(paper).add(scissors))

delay = File("delay", "1000")
tick = File("tick.js", "(function () {                                    \
  var choice = Math.floor(Math.random() * Object.keys(_.choices).length); \
  console.log(_.choices[choice]);                                         \
})")
start = File("start.js", "(function () { \
  var x = setTimeout(function tick () {  \
    _.tick();                            \
    x = setTimeout(_.tick, _.delay);     \
  });                                    \
  return function stop () {              \
    clearTimeout(x)                      \
  }                                      \
})")
root.add(start).add(tick).add(delay);

stop = root().start()
```

Once started, this simple rock-paper-scissors bot will print a random value
every 1000 milliseconds. At any moment, you can set the `source` of `delay`,
`tick`, or any of the `choices`, as well as add and remove new choices, and
see the results as soon as the next `setTimeout` is executed.

## Loader

Files and Directories, Glagol's principal building blocks, are not named so
for lack of imagination. Thanks to the `Loader`, a whole fleet of `File` and
`Directory` objects can be created from a directory on your hard drive, and
then automatically kept up to date.
