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
      [ button('glagol',    add('glagol'))
      , button('iframe',    add('iframe'))
      , button('directory', add('directory'))
      , button('process',   add('process')) ])
    , section('frames:',  frames)
    , section('sockets:', sockets)
    , section('columns:',
      Object.keys(state.visibleColumns).map(
        function (name) {
          var visible = !!state.visibleColumns[name];
          return button(name, toggleCol(name, visible), visible); }))
    , section('options:',
      Object.keys(state.displayOptions).map(
        function (name) {
          var visible = !!state.displayOptions[name];
          return button(name, toggleOpt(name, visible), visible) }))
    ]);

  function button (text, onclick, highlight) {
    return h('.SidebarButton' + (highlight ? '.Highlight': ''),
      { onclick: onclick }, text);
  }

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
      model[name].set(!model[name]());
    }
  }

})
