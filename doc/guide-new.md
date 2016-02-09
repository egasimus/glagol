# The Glagol Guide for Great Good

This guide assumes that you have a general familiarity with JavaScript
programming concepts, and that you have access to a command shell with
Node.js and NPM installed.

Install Glagol with `npm install glagol`, then start `node` and type:

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

Let's explore some of its properties:

```js
> hello.source
'console.log("Hello world!")'
> hello.value
Hello world!
undefined 
```

(If `hello.value` just blurted out the same string, start over and make sure
you give the `File` a name that ends in `.js`)

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

No `Hello world!` this time? What happened? Evaluating code is costly and may
trigger side effects. Hence, code is only evaluated once, and then its value
is cached for subsequent reuse. Let's reset it:

```js
> hello.reset()
{ [Function: hello.js] ... } // .reset() is chainable!
> hello()
Hello world!
undefined 
```

That's better.

About `hello` being a function. One nice thing that JavaScript lets you do is
treat a `Function` like any other `Object`, and that includes adding custom
properties to it. The converse is however impossible: you can't make a
callable object unless you start out with a function.

This is why `File` is actually a _factory_ rather than a _constructor_:
`new File()` throws an error message, and `hello instanceof File` returns
`false`. In order to check whether some object is a `File`, use `File.is`:

```
> File.is(hello)
true
```
