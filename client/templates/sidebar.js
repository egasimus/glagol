(function (state) {

  var frames = state.frames.map(function (frame, i) {
    return h('.SidebarButton', i + ' ' + frame.type + '+' + frame.address);
  })

  var sockets = Object.keys(state.sockets).map(function (id) {
    return h('.SidebarButton', id);
  })

  var toggleCol = toggle.bind(null, App.model.visibleColumns)
    , toggleOpt = toggle.bind(null, App.model.displayOptions);

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
            { onclick: toggleCol(name, visible) },
            name); }))
    , section('options:',
      [ 'expand', 'line numbers' ].map(
        function (name) {
          var visible = state.displayOptions.indexOf(name) > -1;
          return h('.SidebarButton' + (visible ? '.Highlight' : ''),
            { onclick: toggleOpt(name, visible) },
            name); }))
    ]);

  function section (title, children) {
    return h('.SidebarSection',
      [ h('.SidebarSectionHeader', title) ].concat(children)) }

  function add(type) {
    return function (event) {
      event.preventDefault();
      $.commands.add(type);
    }
  }

  function toggle(model, name, visible) {
    return function (event) {
      event.preventDefault();
      var index = model().indexOf(name);
      if (visible && index > -1) {
        model.splice(index, 1);
      } else if (index === -1) {
        model.push(require('riko-mvc/model')(name));
      }
    }
  }

})
