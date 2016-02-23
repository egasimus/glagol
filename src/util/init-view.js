(function () {

  var view = require('riko-mvc').V($.state, $.render);
  document.body.innerHTML = "";
  document.body.appendChild(view.target);

  // update view if templates are edited
  Glagol.nodes[$.options.glagolWebClient.templateDirectory].events.onAny(
    function () { view.update($.state()) });

  return view;

})
