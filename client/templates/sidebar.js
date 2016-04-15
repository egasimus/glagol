(function (state) {

  var frames = state.frames.map(function (frame, i) {
    return h('.SidebarButton', i + ' ' + frame.type + '+' + frame.address);
  })

  var sockets = Object.keys(state.sockets).map(function (id) {
    return h('.SidebarButton', id);
  })

  return h('.Sidebar',
    [ h('.SidebarSection',
      [ h('.SidebarSectionHeader', 'add...')
      , h('.SidebarButton', { onclick: add('glagol') }, 'glagol')
      , h('.SidebarButton', { onclick: add('iframe') }, 'iframe') ])
    , h('.SidebarSection',
      [ h('.SidebarSectionHeader', 'frames:') ].concat(frames))
    , h('.SidebarSection',
      [ h('.SidebarSectionHeader', 'sockets:') ].concat(sockets))
    ]);

  function add(type) {
    return function (event) {
      event.preventDefault();
      $.commands.add(type);
    }
  }

})
