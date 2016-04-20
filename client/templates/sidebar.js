(function (state) {

  var frames = state.frames.map(function (frame, i) {
    return h('.SidebarButton', i + ' ' + frame.type + '+' + frame.address);
  })

  var sockets = Object.keys(state.sockets).map(function (id) {
    return h('.SidebarButton', id);
  })

  return h('.Sidebar',
    [ section('add...',
      [ h('.SidebarButton', { onclick: add('glagol') }, 'glagol')
      , h('.SidebarButton', { onclick: add('iframe') }, 'iframe') ])
    , section('frames:',  frames)
    , section('sockets:', sockets)
    , section('columns:',
      [ 'name', 'source', 'compiled', 'value', 'format', 'options' ].map(
        function (name) {
          var visible = state.visibleColumns.indexOf(name) > -1;
          return h('.SidebarButton' + (visible ? '.Highlight' : ''),
            { onclick: toggle(name, visible) },
            name); })) ]);

  function section (title, children) {
    return h('.SidebarSection',
      [ h('.SidebarSectionHeader', title) ].concat(children)) }

  function add(type) {
    return function (event) {
      event.preventDefault();
      $.commands.add(type);
    }
  }

  function toggle(column, visible) {
    return function (event) {
      event.preventDefault();
      var index = App.model.visibleColumns().indexOf(column);
      if (visible) {
        if (index > -1) {
          App.model.visibleColumns.splice(index, 1);
        }
      } else {
        if (index === -1) {
          App.model.visibleColumns.push(require('riko-mvc/model')(column));
        }
      }
    }
  }

})
