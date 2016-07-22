(function (state) {

  return state.Debugger.displayOptions['show sidebar']
    ? expandedSidebar()
    : collapsedSidebar()

  function collapsedSidebar () {
    return h('.SidebarCollapsed', { onclick: function (event) {
      event.preventDefault();
      App.Model.Debugger.displayOptions.put('show sidebar', true);
    } })
  }

  function expandedSidebar () {

    var sockets = Object.keys(state.Debugger.sockets).map(function (id) {
      return h('.Sidebar_Button', id);
    })

    var toggleCol = toggle.bind(null, App.Model.Debugger.visibleColumns)
      , toggleOpt = toggle.bind(null, App.Model.Debugger.displayOptions);

    return h('.Sidebar',
      [ section('add:',
        [ button([ $.lib.icon('folder-open-o'), ' directory' ], add('directory'))
        , button([ $.lib.icon('square-o'),      ' iframe'    ], add('iframe'))
        , button([ $.lib.icon('sitemap'),       ' glagol'    ], add('glagol'))
        , button([ $.lib.icon('server'),        ' service'   ], add('service'))
        ])
      , h('.FlexSpacer')
      , button([ $.lib.icon('angle-double-left'), 'hide' ], toggleOpt('show sidebar', true))
      ]);
      //, section('sockets:', sockets)
      //, section('columns:',
        //Object.keys(state.Debugger.visibleColumns).map(
          //function (name) {
            //var visible = !!state.Debugger.visibleColumns[name];
            //return button(name, toggleCol(name, visible), visible); }))
      //, section('options:',
        //Object.keys(state.Debugger.displayOptions).map(
          //function (name) {
            //var visible = !!state.Debugger.displayOptions[name];
            //return button(name, toggleOpt(name, visible), visible) }))
  }

  function button (text, onclick, highlight) {
    return h('.Sidebar_Button' + (highlight ? '.Highlight': ''),
      { onclick: onclick }, text);
  }

  function section (title, children) {
    return h('.Sidebar_Section',
      [ h('.Sidebar_Section_Header', title) ].concat(children)) }

  function add(type) {
    return function (event) {
      event.preventDefault();
      __.open(type);
    }
  }

  function toggle(model, name, visible) {
    return function (event) {
      event.preventDefault();
      model[name].set(!model[name]());
    }
  }

})
