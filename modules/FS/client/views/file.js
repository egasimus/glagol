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
      body = defaultWrappers(h('div.ImageContainer', addSrc(h('img'))))
      break;
    case 'text/plain':
      body = defaultWrappers(_.editor(file.path), true);
      break;
    default:
      body = defaultWrappers(h('.File_Unknown',
        [ $.lib.icon('info-circle') 
        , 'This file has an unfamiliar type, '
        , h('em', file.contentType) ]), false);
  }

  return body;

  function addSrc (vnode) {
    vnode.properties.src = '/api/FS/ReadFile?' + JSON.stringify([file.path]);
    return vnode;
  }

  function defaultWrappers (body, canSave) {
    return [
      h('.File_Toolbar',
        [ h('button', $.lib.icon('refresh'))
        , canSave ? h('button', $.lib.icon('save')) : null]),
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

})
