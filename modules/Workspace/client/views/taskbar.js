module.exports = function (state) {

  var tasks = {};
  state.Workspace.Frames.forEach(function (frame) {
    tasks[frame.type] = tasks[frame.type] ? tasks[frame.type] + 1 : 1
  });

  return h('.Taskbar',
    [ h('.Taskbar_Group',
      [ h('button.Taskbar_Button', $.lib.icon('th'))
      ])
    , h('.Taskbar_Group',
      [ h('button.Taskbar_Button', $.lib.icon('cloud'))
      , h('button.Taskbar_Button', $.lib.icon('volume-up'))
      , h('button.Taskbar_Button', $.lib.icon('battery-half'))
      , h('button.Taskbar_Button', $.lib.icon('cogs'))
      , h('button.Taskbar_Clock', [ 'Foo', h('br'), 'Bar' ])
      ])
    ])

}
