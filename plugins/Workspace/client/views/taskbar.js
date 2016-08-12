module.exports = function (state) {

  var tasks = {};
  state.Workspace.Frames.forEach(function (frame) {
    tasks[frame.type] = tasks[frame.type] ? tasks[frame.type] + 1 : 1
  });

  return h('.Taskbar',
    [ h('.Taskbar_Group',
      [ h('button.Taskbar_Button' + (state.Workspace.MainMenu.visible ? '.active' : ''),
          { onclick: toggle('MainMenu') },
          $.lib.icon('th'))
      , h('button.Taskbar_Button', { onclick: __.reload  }, [$.lib.icon('refresh'), ' reload' ])
      , h('button.Taskbar_Button', { onclick: refresh    }, [$.lib.icon('refresh'), ' refresh']) 
      ])
    , __.model.MainMenu.visible() ? _.mainMenu(state) : null
    , h('.Taskbar_Group', taskbarButtons(state.Workspace.Frames))
    , h('.Taskbar_Group',
      [ h('button.Taskbar_Button', $.lib.icon('cloud'))
      , h('button.Taskbar_Button', $.lib.icon('volume-up'))
      , h('button.Taskbar_Button', $.lib.icon('battery-half'))
      , h('button.Taskbar_Button', $.lib.icon('cogs'))
      , _.clock()
      ])
    ])

}

function taskbarButtons (frames) {
  var types = {}
    , buttons = [];
  frames.forEach(function (f) { types[f.type] = (types[f.type] || 0) + 1 });
  buttons = Object.keys(types).map(function (type) {
    var label = __.icons[type] ? $.lib.icon(__.icons[type]) : type
      , count = types[type]
    return h('button.Taskbar_Button', [ label, count > 1 ? ' ' + count : '' ])
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
