(function (frame, index) {

  var file = App.model.files()[frame.address];

  var body = 'unknown file type: ' + file.type;

  switch (file.type) {
    case 'audio/mpeg':
    case 'audio/x-wav':
      body = addSrc(h('audio', { controls: true }))
      break;
    case 'image/png':
    case 'image/jpeg':
      body = addSrc(h('img'))
      break;
  }

  return h('.File', body);

  function addSrc (vnode) {
    vnode.properties.src = '/file/' + file.name_;
    return vnode;
  }

})
