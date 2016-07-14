module.exports = function (state) {
  return h('.Taskbar_MainMenu',
    [ h('.Taskbar_MainMenu_Item', [ h('strong', 'O'), 'pen...' ])
    , h('.Taskbar_MainMenu_Item', [ h('strong', 'R'), 'un...'  ])
    , h('.Taskbar_MainMenu_Item', { onclick: addSequencer },
        [ 'Seq', h('strong', 'u'), 'encer'])
    , h('.Taskbar_MainMenu_Item', { onclick: addMixer },
        [ h('strong', 'M'), 'ixer' ])
    ])
}

function addSequencer () {
  App.API('Workspace/Open', 'sequencer');
}

function addMixer () {
  App.API('Workspace/Open', 'mixer');
}
