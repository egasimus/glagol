(function () {

  var view = require('riko-mvc').V($.state, $.render);
  document.body.innerHTML = "";
  document.body.appendChild(view.target);

  // update view if templates are edited
  Glagol.nodes['templates'].events.onAny(function () {
    view.update($.state()) });

  return view;

})
