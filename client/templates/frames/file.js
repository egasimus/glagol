(function (frame, index) {

  var file = App.model.files()[frame.address] || {};

  var body = 'unknown file type: ' + file.type;

  switch (file.contentType) {
    case 'audio/mpeg':
    case 'audio/x-wav':
      body = h('.AudioPlayer',
        [ h('.AudioPlayerButton', { onclick: playback }, '▶')
        , h('.AudioPlayerInfo', require('path').basename(file.path))
        , addSrc(h('audio', { controls: true })) ]);
      break;
    case 'image/png':
    case 'image/jpeg':
      body = addSrc(h('img'))
      break;
    case 'text/plain':
      body = _.glagolEditor({ source: 'foo' })
      break;
  }

  return h('.File', body);

  function addSrc (vnode) {
    vnode.properties.src = '/file/' + file.name_;
    return vnode;
  }

  function playback (event) {
    event.preventDefault();
    var audio = event.target.parentElement.querySelector('audio');
    audio.play();
  }

})
