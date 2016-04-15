(function (state) {

  var sessions = Object.keys(state.sessions).map(function (id) {
    return h('.SidebarButton', id);
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
      [ h('.SidebarSectionHeader', 'windows:') ].concat(sessions))
    , h('.SidebarSection',
      [ h('.SidebarSectionHeader', 'sockets:') ].concat(sockets))
    ]);

  function add(type) {
    return function (event) {
      event.preventDefautl();
      if (type === 'iframe') {
        console.log(App.model.iframes());
      }
    }
  }

})
