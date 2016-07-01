(function (frame, index) {

  var file = App.Model.FS.Files()[frame.address] || {}
    , body;

  switch (file.contentType) {
    case undefined:
      body = 'loading...';
      break;
    case 'audio/mpeg':
    case 'audio/x-wav':
      var playerId = frame.id + '_' + file.path;
      if (!App.Model.Sound.Players()[playerId])   loadAudioPlayer(file.path);
      if (!App.Model.Sound.Metadata()[file.path]) loadAudioMetadata(file.path);
      body = $.modules.Sound.views.audio(frame.id, file.path);
      break;
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
      body = defaultLayout(h('div.ImageContainer', addSrc(h('img'))))
      break;
    case 'text/plain':
      var ext = require('path').extname(file.path);
      switch (ext) {
        case '.m3u8':
          body = defaultLayout(
            __.__.Sound.views.playlist(frame, file),
            h('.File_Toolbar',
              [ h('button', $.lib.icon('refresh'))
              , h('button', $.lib.icon('save')),
              , h('button', $.lib.icon('eye')) ]));
          break;
        default:
          body = defaultLayout(_.editor(file.path), true);
      }
      break;
    default:
      body = defaultLayout(h('.File_Unknown',
        [ $.lib.icon('info-circle') 
        , 'This file has an unfamiliar type, '
        , h('em', file.contentType) ]), false);
  }

  return body;

  function addSrc (vnode) {
    vnode.properties.src = '/api/FS/ReadFile?' + JSON.stringify([file.path]);
    return vnode;
  }

  function defaultLayout (body, toolbar) {
    return [
      toolbar || h('.File_Toolbar',
        [ h('button', $.lib.icon('refresh')) ]),
      h('.File_Body',
        [ h('header.Frame_Header',
           [ $.lib.icon('file.fa-2x')
           , h('input.Frame_Address',
             { onchange: changeAddress
             , value:    file.path })
           , h('.Frame_Close', { onclick: close }, '×')
           ])
        , body
        ]) ];

    function changeAddress (event) {
      event.preventDefault();
      App.API('Workspace/Change', frame.id, 'address', event.target.value);
    }

    function close (event) {
      event.preventDefault();
      App.API('Workspace/Close', frame.id);
    }
  }

  function loadAudioPlayer (src) {
    setTimeout(function () {
      App.Model.Sound.Players.put(playerId, $.modules.Sound.player(src))
    }, 0);
  }

  function loadAudioMetadata (src) {
    setTimeout(function () {
      App.Model.Sound.Metadata.put(src, 'loading');
      var url = '/api/Sound/GetMetadata?' + JSON.stringify([src])
        , xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () {
        App.Model.Sound.Metadata.put(src, JSON.parse(xhr.response).data);
      }
      xhr.onerror = function () {
        App.Model.Sound.Metadata.put(src, 'failed');
      }
      xhr.send();
    })
  }

})
