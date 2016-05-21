(function (event, node) {

  $.log($.util.colors.bold("->"), event, node.path);

  var name    = node.name
    , file    = node._glagol.type === 'File'
    , dir     = node._glagol.type === 'Directory'
    , parent  = node.parent
    , parent2 = parent  ? parent.parent  : null
    , parent3 = parent2 ? parent2.parent : null

  if (dir && parent._sourcePath === $.options.pids) {
    $.log(event, "task root", node.path);
    return;
  }

  if (file && parent2 && parent2._sourcePath === $.options.pids && name === 'info') {
    $.log(event, "task info", node.path);
    $.task[event](node);
    return;
  }

})
