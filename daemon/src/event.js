(function (event, node) {

  $.log($.util.colors.bold("->"), event, node.path);

  var name    = node.name
    , file    = node._glagol.type === 'File'
    , dir     = node._glagol.type === 'Directory'
    , parent  = node.parent
    , parent2 = parent  ? parent.parent  : null
    , parent3 = parent2 ? parent2.parent : null

  if (dir && parent._sourcePath === $.options.pids) {
    $.log(event, "job root", node.path);
    return;
  }

  if (file && parent2 && parent2._sourcePath === $.options.pids && name === 'info') {
    $.log(event, "job info", node.path);
    $.job[event](node);
    return;
  }

})
