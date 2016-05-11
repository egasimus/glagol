(function (state) {

  //return h('.TopBar', state.Workspace.frames.map(function (frame, i) {
    //var icon =
      //frame.type === 'directory' ? $.lib.icon('folder-open-o') :
      //frame.type === 'file'      ? $.lib.icon('music') : '???'
    //return h('.TopBar_Button',
      //[ icon, ' '
      //, require('path').basename(frame.address) ]);
  //}))

  return h('.TopBar' + (state.Workspace.bars.top.show ? '.Visible' : '.Hidden'),
    h('input.TopBar_Input',
      { type:      'text'
      , value:     state.Workspace.bars.top.input
      , onblur:    blur
      , onkeyup:   update
      , hookFocus: require('focus-hook')() }))

  function blur () {
    App.Model.Workspace.bars.top.show.set(false);
  }

  function update (event) {

    if (event.code === 'Escape') {
      blur();
      return;
    }

    var el  = document.getElementsByClassName('TopBar_Input')[0]

    if (event.code === 'Enter') {
      console.info('Entered command:', el.value);
      __.__.command(el.value);
      el.blur();
      App.Model.Workspace.bars.top.input.set('');
      return;
    }

    App.Model.Workspace.bars.top.input.set(el.value);

  }

})
