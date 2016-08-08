var templates =

  { unknown:
      function (input, frame) {
        return defaultLayout(h('.File_Unknown',
        [ $.lib.icon('info-circle')
        , h('em.File_Unknown_Title', file.path)
        , h('br')
        , 'has an unfamiliar type, '
        , h('em', file.contentType)
        , h('br')
        , 'Open as: '
        , h('button', { onclick: setType('textEditor')  }, 'Plaintext')
        , ' '
        , h('button', { onclick: setType('hexEditor')   }, 'Binary')
        , ' '
        , h('button', { onclick: setType('selecttype')  }, 'Other type...') ]), false); }

  , textEditor:
      function () {
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
            body = defaultLayout(_.textEditor(file.path));
        }
      }

  , sound:  
      function () {
        var playerId = frame.id + '_' + file.path;
        if (!App.Model.Sound.Players()[playerId])   loadAudioPlayer(file.path, playerId);
        if (!App.Model.Sound.Metadata()[file.path]) loadAudioMetadata(file.path);
        body = _.sound(frame.id, file.path);
      }

  , image:
      function () {
        return defaultLayout(
          h('div.ImageContainer',
            h('img', { src: '/api/FS/ReadFile?' + JSON.stringify([file.path]) })))
      }

  , defaultLayout:
      function (body, toolbar) {
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

  };

module.exports = function render (frame, index) {
  var file = App.Model.FS.Files()[frame.address]
  if (!file) {
    App.API('FS/GetInfo', frame.address)
    return 'loading...'
  }
  var type = __.type(file.contentType, App.Model.Workspace.Frames.get(index));
  if (!type) {
    return JSON.stringify(frame)
  } else {
    App.API('Workspace/Change', frame.id, 'type', type);
    return _[type](frame, index);
  }
}
