(function (event, node) {

  var bold = $.util.colors.bold
    , blue = $.util.colors.blue

  var name    = node.name
    , file    = node._glagol.type === 'File'
    , dir     = node._glagol.type === 'Directory'
    , parent  = node.parent
    , parent2 = parent  ? parent.parent  : null
    , parent3 = parent2 ? parent2.parent : null

  if (dir && parent._sourcePath === $.options.pids) {
    $.log(event, bold('job root'), blue(node.path));
    return;
  }

  if (file && parent2 && parent2._sourcePath === $.options.pids && name === 'info') {
    $.log(event, $.util.colors.bold('job info'), blue(node.path));
    $.job[event](node);
    return;
  }

  if (dir && parent2 && parent2._sourcePath === $.options.pids) {
    return;
  }

  if (file && parent3 && name === 'info') {
    $.log(event, bold('process info'), blue(node.path))
    return;
  }

  $.log(event, bold("unknown"), blue(node.path));

})
