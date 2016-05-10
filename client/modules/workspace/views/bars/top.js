(function (state) {

  //return h('.TopBar', state.Workspace.frames.map(function (frame, i) {
    //var icon =
      //frame.type === 'directory' ? $.lib.icon('folder-open-o') :
      //frame.type === 'file'      ? $.lib.icon('music') : '???'
    //return h('.TopBar_Button',
      //[ icon, ' '
      //, require('path').basename(frame.address) ]);
  //}))

  return h('.TopBar',
    h('input.TopBar_Input',
      { type:      'text'
      , onblur:    blur
      , onkeydown: update
      , hookFocus: require('focus-hook')() }))

  function blur () {
    App.Model.Workspace.bars.top.show.set(false);
  }

  function update (event) {
    if (event.code === 'Escape') {
      blur();
    }
    if (event.code === 'Enter') {
      var el  = document.getElementsByClassName('TopBar_Input')[0]
        , val = el.value;
      App.Workspace('add', 'iframe', 'https://duckduckgo.com/?q=' + val);
      console.info('Entered command:', val);
    }
  }

})
