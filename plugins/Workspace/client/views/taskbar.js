module.exports = function (state) {

  var tasks = {};
  state.Workspace.Frames.forEach(function (frame) {
    tasks[frame.type] = tasks[frame.type] ? tasks[frame.type] + 1 : 1
  });

  var left =
    [ h('button.Taskbar_Button' + (state.Workspace.MainMenu.visible ? '.active' : ''),
        { onclick: toggle('MainMenu') },
        $.lib.icon('th'))
    , button([ $.lib.icon('refresh'), ' reload'  ], __.reload)
    , button([ $.lib.icon('refresh'), ' refresh' ],    refresh) ];

  var middle =
    taskbarButtons(state.Workspace.Frames);

  var right =
    [ button($.lib.icon('cloud'))
    , button($.lib.icon('volume-up'))
    , button($.lib.icon('battery-half'))
    , button($.lib.icon('cogs'))
    , _.clock() ];

  return h('.Taskbar',
    [ h('.Taskbar_Group', left)
    , __.model.MainMenu.visible() ? _.mainMenu(state) : null
    , h('.Taskbar_Group', middle)
    , h('.Taskbar_Group', right) ])

}

function button (body, onclick) {
  return h('button.Taskbar_Button', { onclick: onclick }, body);
}

function taskbarButtons (frames) {
  var types = {}
    , buttons = [];
  frames.forEach(function (f) { types[f.type] = (types[f.type] || 0) + 1 });
  buttons = Object.keys(types).map(function (type) {
    var label = __.icons[type] ? $.lib.icon(__.icons[type]) : type
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
