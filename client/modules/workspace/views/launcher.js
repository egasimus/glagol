(function (state) {

  var state = state.Workspace.Launcher;

  if (!state.visible) return h('.Launcher.Hidden');

  var Launcher = App.Model.Workspace.Launcher;

  return h('.Launcher.Visible',
    [ h('.Launcher_Label', state.mode)
    , h('input.Launcher_Input',
        { type:      'text'
        , value:     state.input
        , onblur:    hide
        , onkeyup:   update
        , hookFocus: require('focus-hook')() })
    ]);

  function item (text) {
    var split = text.split('&');
    return h('.Launcher_Item',
      [ split[0]
      , h('strong', h('u', (split[1] || '')[0]))
      , (split[1] || '').slice(1) ])
  }

  function hide () {
    Launcher.visible.set(false);
  }

  function update (event) {
    if (event.code === 'Escape') {
      hide();
      return;
    }

    var el = document.getElementsByClassName('Launcher_Input')[0]

    if (event.code === 'Enter') {

      console.info(state.mode, el.value);
      hide();

      switch (state.mode) {
        case 'Open':
          __.maps.opener(el.value)
          break;
        case 'Run':
          break;
      }

      return;
    }

    Launcher.input.set(el.value);

  }

  // ------------------------------------

  //return h('.Launcher', state.Workspace.frames.map(function (frame, i) {
    //var icon =
      //frame.type === 'directory' ? $.lib.icon('folder-open-o') :
      //frame.type === 'file'      ? $.lib.icon('music') : '???'
    //return h('.Launcher_Button',
      //[ icon, ' '
      //, require('path').basename(frame.address) ]);
  //}))

})
