(function (frame, index) {

  var file = App.Model.FS.Files()[frame.address] || {};

  var body;

  switch (file.contentType) {
    case undefined:
      body = 'loading...';
      break;
    case 'audio/mpeg':
    case 'audio/x-wav':
      var playerId = frame.id + '_' + file.path;
      if (!App.Model.Sound.Players()[playerId]) {
        setTimeout(function () {
          App.Model.Sound.Players.put(playerId, $.modules.Sound.player(file.path))
        }, 0);
      }
      body = $.modules.Sound.views.audio(frame.id, file.path);
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
    vnode.properties.src = '/file?path=' + file.path;
    return vnode;
  }

})
