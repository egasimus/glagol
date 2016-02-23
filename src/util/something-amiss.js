(function () {

  var missing = []
    , expected =
      { templateDirectory: 'directory of virtual-dom templates'
      , stateFile: 'observ-struct instance, pre-populated with initial state'
      , styleFile: 'stylesheet' };

  Object.keys(expected).forEach(function (check) {
    var name = $.options.glagolWebClient[check];
    if (!Glagol.nodes[name]) {
      missing.push(check);
      if (missing.length === 1) {
        document.body.innerHTML = "";
        document.write("<p>The following required files are missing from your code:</p><ul>");
      }
      document.write("<li><strong>" + name + "</strong>: " + expected[check] + "</li>")
    }
  })

  return missing.length > 0;

})
