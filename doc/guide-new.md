# The Glagol Guide for Great Good

This guide assumes that you have a general familiarity with JavaScript
programming concepts, access to a command shell with Node.js and NPM installed,
and a little patience because we're starting with the basics.

## Files

### Creating

Having installed Glagol with `npm install glagol`, then start `node` and type:

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
{ [Function: hello-world.js] ... } // .reset() is chainable!
> hello()
Hello world!
undefined 
```

### Mutating

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

# Objects as first-class functions

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

# Type checking

So if you need to check whether some object is a `File`, use `File.is`:

```
> File.is(hello)
true
```

The same principles holds true for the rest of Glagol's facilities.

## Directories

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

### Populating

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

### Evaluating

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

### Deleting

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
root.add(choices.add(leaf1).add(leaf2).add(leaf3))

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
