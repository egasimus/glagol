(function (state) {

  var state = state.Workspace.bars.top

  if (!state.show) return h('.TopBar.Hidden');

  var model = App.Model.Workspace.bars.top
    , contents;

  switch (state.input[0]) {
    case 'Open':
    case 'Run':
      contents = prompt(state.input[0]);
      break;
    default:
      contents =
      [ item('&Open')
      , item('&Run')
      , item('&H')
      , item('&L')
      , item('&J')
      , item('&K') ]
  }

  return h('.TopBar.Visible', contents);

  function item (text) {
    var split = text.split('&');
    return h('.TopBar_Item',
      [ split[0]
      , h('strong', h('u', (split[1] || '')[0]))
      , (split[1] || '').slice(1) ])
  }

  function prompt (text) {
    return [
      h('.TopBar_Label', text),
      h('input.TopBar_Input',
        { type:      'text'
        , value:     state.input[1]
        , onblur:    hide
        , onkeyup:   update
        , hookFocus: require('focus-hook')() })
    ];
  }

  function hide () {
    model.show.set(false);
  }

  function update (event) {
    if (event.code === 'Escape') {
      blur();
      return;
    }

    var el = document.getElementsByClassName('TopBar_Input')[0]
    if (event.code === 'Enter') {
      console.info('Entered command:', el.value);
      //__.__.command(el.value);
      el.blur();
      model.input.set('');
      return;
    }

    model.input.set(el.value);

  }

  // ------------------------------------

  //return h('.TopBar', state.Workspace.frames.map(function (frame, i) {
    //var icon =
      //frame.type === 'directory' ? $.lib.icon('folder-open-o') :
      //frame.type === 'file'      ? $.lib.icon('music') : '???'
    //return h('.TopBar_Button',
      //[ icon, ' '
      //, require('path').basename(frame.address) ]);
  //}))

})
