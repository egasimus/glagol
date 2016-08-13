var icon = $.lib.icon;

module.exports = function (state) {

  var tasks = state.Workspace.Frames.reduce(function (tasks, frame) {
    tasks[frame.type] = tasks[frame.type] ? tasks[frame.type] + 1 : 1 }, {});

  var left =
    [ button(icon('th'), toggle('MainMenu'), ifVisible('MainMenu', '.active'))
    , button([ icon('refresh'), ' reload'  ], __.reload)
    , button([ icon('refresh'), ' refresh' ],    refresh) ];

  var middle =
    taskbarButtons(state.Workspace.Frames);

  var right =
    [ button(icon('cloud'))
    , button(icon('volume-up'))
    , button(icon('battery-half'))
    , button(icon('cogs'), toggle('PluginManager'), ifVisible('PluginManager', '.active'))
    , _.clock() ];

  return h('.Taskbar',
    [ h('.Taskbar_Group', left)
    , ifVisible('MainMenu', _.mainMenu(state))
    , h('.Taskbar_Group', middle)
    , h('.Taskbar_Group', right)
    , ifVisible('PluginManager',  _.pluginManager(state))
    ])

  function ifVisible (component, value) {
    component = state.Workspace[component];
    return (component && component.visible) ? value : null;
  }

}

function button (body, onclick, cls) {
  return h('button.Taskbar_Button' + (cls || ''), { onclick: onclick }, body);
}

function taskbarButtons (frames) {
  var types = {}
    , buttons = [];
  frames.forEach(function (f) { types[f.type] = (types[f.type] || 0) + 1 });
  buttons = Object.keys(types).map(function (type) {
    var label = __.icons[type] ? icon(__.icons[type]) : type
      , count = types[type]
    return button([ label, count > 1 ? ' ' + count : '' ])
  });
  return buttons;
}

function toggle (component) {
  return function () {
    __.model[component].visible.set(!__.model[component].visible());
  }
}

function refresh () {
  App.View.update(App.Model());
  // TODO figure out why error styling persists
  App.View.target.style.color = '';
  App.View.target.style.background = '';
  console.log(App)
}
