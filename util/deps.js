(function () {

  var path = require('path');

  return detect;

  function detect (rootNode) {

    var ids = {}, deps = {};

    _detect(rootNode);

    return { ids: ids, deps: deps }

    function _detect (node) {

      if (node.nodes) {

        Object.keys(node.nodes).map(function (n) {
          _detect(node.nodes[n]);
        })

      } else if (node.compiled) {

        var opts   = { basedir: path.dirname(node._filename) }
          , myDeps = deps[node.path] = {};

        require('detective')(node.compiled).forEach(function (d) {

          if (d === 'glagol-web') {
            // special case since we're already including ourselves for thawing
            myDeps[d] = d;
            return;
          }

          var resolved = require('browser-resolve').sync(d, opts);
          ids[resolved] = ids[resolved] || require('shortid').generate();
          myDeps[d] = ids[resolved];

        })

      }

    }

  }

})()
