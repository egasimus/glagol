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
      , h('button.Taskbar_Button', { onclick: __.reload }, $.lib.icon('refresh')) 
      , h('button.Taskbar_Button', { onclick: function () { App.View.update(App.Model()) } }, $.lib.icon('refresh')) 
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

var ICONS =
  { 'directory':   'folder-open'
  , 'machineList': 'server'
  , 'deviceList':  'database'
  , 'serviceList': 'th-large' 
  , 'terminal':    'terminal'
  , 'sequencer':   'clock-o'
  , 'file':        'file'
  , 'mixer':       'sliders'
  , 'sound':       'play-circle'
  , 'textEditor':  'pencil-square'};

function taskbarButtons (frames) {
  var types = {}
    , buttons = [];
  frames.forEach(function (f) { types[f.type] = (types[f.type] || 0) + 1 });
  buttons = Object.keys(types).map(function (type) {
    var label = ICONS[type] ? $.lib.icon(ICONS[type]) : type
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
