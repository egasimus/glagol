(function () {

  var path = require('path');

  return detect;

  function detect (rootNode) {

    var ids = {}
      , deps = {};

    _detect(rootNode);

    return { ids: ids, deps: deps }

    function _detect (node) {

      if (node.nodes) {

        Object.keys(node.nodes).map(function (n) {
          _detect(node.nodes[n]);
        })

      } else if (node.compiled) {

        var opts   = { filename: node._sourcePath || "" }
          , myDeps = deps["/" + path.relative(rootNode.path, node.path)] = {};

        require('detective')(node.compiled).forEach(function (d) {
          var resolved = require('browser-resolve').sync(d, opts);
          ids[resolved] = ids[resolved] || require('shortid').generate();
          myDeps[d] = ids[resolved];
        })

      }

    }

  }

})()
