# Roadmap

* Finalize runtime API
* Add API for specifying custom globals and custom sandboxing methods.
* Unify `Script` and `Directory` classes -- see dirs as just another file type
* Replace Jasmine's built-in test runner with a dogfooded one
* Write detailed documentation for the available classes

## Known embarrasing issues

* Neither named or unnamed top-level functions seem to work properly
* Wisp: error messages are much less clear than they could be; server-side
  source map support is yet to be implemented, and compile errors after runtime
  updates aren't thrown (instead the failed script's value gets set to
  `undefined`, which causes an exception further down the road)
* New directories still can't be created during runtime (files are ok though)
