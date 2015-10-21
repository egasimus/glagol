# Glagol 1.0.0

Glagol is a Node.js framework. It enables you to build programs that can be
edited on the fly. It also lets you use preprocessors such as Wisp or
CoffeeScript directly, without complicated build systems.


## In a nutshell

```
sudo npm install -g wisp glagol
mkdir x
echo '"edit me"' > x/a
echo '1000' > x/b
echo '(function r () { log(_["a"], _["b"]); setTimeout(r, _["b"]) })()' > x/c
glagol x/c
```

Now go ahead and edit the files `a` and `b`, and watch as the output of `c`
changes.


## Documentation

* [Changelog](https://github.com/egasimus/etude-engine/blob/master/CHANGELOG.md)
* [Roadmap](https://github.com/egasimus/etude-engine/blob/master/doc/roadmap.md)
* [Example applications in various stages of incompleteness](https://github.com/egasimus/etude-engine/blob/master/doc/examples.md)


## License
* Released under [GNU GPL3](https://github.com/egasimus/etude-engine/blob/master/LICENSE)
