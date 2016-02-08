/// THIS WHOLE THING TURNED OUT TO BE UNNECESSARY, COMMENTS AND ALL



function require (what) {
          return myRequire(what)
          // resolves each require call and checks if it points to a module
          // inside the currently running Glagol installation, preventing
          // duplicate yet separate imports of stateful parts of Glagol
          // (such as the global Loader) when nesting Glagol instances.

          console.log("requiring".blue, what.bold,
            "as", myPath.bold);

          var resolved = resolve(what, { basedir: path.basename(myPath) });

          // `isAbsolute(...)` makes sure that the module resolves to an actual
          // file somewhere, rather than one of the built-in modules; and then
          // `realpathSync` resolves any symlinks in the way, such as may be
          // encountered e.g. when `npm link` has been used.
          console.log("* resolves to".blue, resolved.bold,
            !path.isAbsolute(resolved) ? "(builtin)" : "");

          if (path.isAbsolute(resolved)) {
            var realpath = fs.realpathSync(resolved);
            if (realpath !== resolved) {
              console.log("* resolves to".blue, realpath.bold);
              resolved = realpath;
            }
          }

          // `path.dirname(__dirname)` is the root directory of the current
          // Glagol installation, which is then checked whether it contains
          // the resolved requirement; the check works similar to `isChildOf`
          // in `loader.js` but the opposite way around.
          var glagolRoot = path.dirname(fs.realpathSync(__dirname))
            , relative = path.relative(glagolRoot, resolved);
          console.log("* this glagol is".blue, glagolRoot.bold);
          var merge =
            path.parse(glagolRoot).root === path.parse(resolved).root &&
            path.parse(relative).dir[0] !== '.' &&
            relative.indexOf('node_modules') === -1;

          // if a file that is part of this Glagol installation is indeed being
          // asked for, it is required from this context, making use of this
          // context's `require.cache` and preventing duplicate evaluation;
          // any other require calls are performed via `require-like`, and are
          // thus resolved relative to the requiring file.
          if (merge) {
            console.log("*".blue, "requiring from Glagol instance".bold)
            return _require(resolved);
          } else {
            return myRequire(what);
          }

          // TODO: since we're already resolving the full path to each require,
          // are there advantages/disadvantages of using either of these:
          //
          //   `requireLike(myPath)(...)`
          //      -vs-
          //   `require(resolve(..., { baseDir: myPath })`

          // TODO: contribute an option for resolving with `realpath` enabled
          //       to `node-resolve`?

        }

