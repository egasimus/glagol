(function (node) {

  var proc = node.parent
    , info = JSON.parse(node());

  console.log(info);

  if (!info.status) {
    info.status = 'starting';
    $.util.write(node._sourcePath, info);
  }

})
