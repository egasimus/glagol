(function (frame, index) {

  var file = App.Model.FS.files()[frame.address] || {};

  var body;

  switch (file.contentType) {
    case undefined:
      body = 'loading...';
      break;
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
      body = _.editor(file.path);
      break;
    default:
      body = 'unknown file type: ' + file.type;
  }

  return h('.File', body);

  function addSrc (vnode) {
    vnode.properties.src = 'http://localhost:1615/file?path=' + file.path;
    return vnode;
  }

})
