# The Glagol Guide for Great Good

This guide assumes that you have a general familiarity with JavaScript
programming concepts, access to a command shell with Node.js and NPM installed,
and a little patience because we'll start from the basics.

Install Glagol with `npm install glagol`, then start `node` and type:

## Files

### Creating

```js
> File = require('glagol').File
> hello = File('hello.js', 'console.log("Hello world!")')
{ [Function: hello.js]
  /* .. lots of stuff ... */ }
```

Having called upon the `File` _factory function_, you now have a `hello`
variable containing a `File` object. It's thinks its name is `hello.js`, and
contains a bit of unevaluated JavaScript source code - the _string_
`'console.log("Hello world!")'`.

### Evaluating

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
{ [Function: hello.js] ... } // .reset() is chainable!
> hello()
Hello world!
undefined 
```

The `value` property of a `File` is immutable: if you try to set `hello.value`
to something else, it won't change. _Its value_, however, can be mutable;
this lets you create objects with initial state that is mutated during their
lifetime, and is brough back to its original state when you change the source
code or call `reset`.

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

Note that the new source is wrapped in an [IIFE (immediately-invoked function expression)](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression)
so that the side effects are now completely separate from the returned value.

Again, how come `File` objects think they're functions? Because they are. But
isn't that a weird thing to do? Well, one nice thing that JavaScript actually
lets you do is augment a `Function` with custom properties, just like you would
do with any other `Object`. The converse, however, seems impossible: you can't
make a callable object unless you start out with a `Function`. (Or I haven't
been able to, anyway.)

When you go down that road, though, you have to give up on JavaScript's
prototypal inheritance: your function-like objects are forever stuck with the
prototype of a `Function`, otherwise they're not callable any more. This is why
`File` itself is actually a _factory_ rather than a _constructor_: `new File()`
throws an error message; and `hello instanceof File` returns `false`.

So if you need to check whether some object is a `File`, use `File.is`:

```
> File.is(hello)
true
```

The same holds true for the rest of Glagol's abstractions.

## Directories

We've seen how Glagol implements a container for executing JavaScript in an
idempotent way. But the real party starts when you bring several of these
together, and to do that you use a `Directory`.

```
> Directory = require('glagol').Directory
{ [Function: Directory] is: [Function] }
> root = Directory("root")
{ [Function: root]
  ... }
> root.add(hello)
```

The `File` is now all alone in an empty `Directory`. Spooky! Being there gives
it a path

```
> 

Just like files,
Directories are callable


```
> choices = Directory("branch")
> leaf1 = File("leaf1", "Rock")
> leaf2 = File("leaf1", "Paper")
> leaf3 = File("leaf1", "Scissors")
> 
> root.add(branch.add(leaf1, leaf2, leaf3))
```
