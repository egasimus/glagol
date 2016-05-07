(function (frame, index) {

  var file = App.model.files()[frame.address] || {};

  var body = 'unknown file type: ' + file.type;

  switch (file.contentType) {
    case 'audio/mpeg':
    case 'audio/x-wav':
      body = _.audio(file.path);
      break;
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
      body = addSrc(h('img'))
      break;
    case 'text/plain':
      body = _.glagolEditor({ source: 'foo' })
      break;
  }

  return h('.File', body);

  function addSrc (vnode) {
    vnode.properties.src = 'http://localhost:1615/file?path=' + file.path;
    return vnode;
  }

})
