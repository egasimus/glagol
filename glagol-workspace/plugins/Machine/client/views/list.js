module.exports = function (state) {

  var machines =
    [ { label: 'hostname (localhost)',        icon: 'laptop' }
    , { label: 'remotehost (163.45.72.5)',    icon: 'server' }
    , { label: 'remotehost2 (42.64.133.122)', icon: 'server' } ];

  return h('.MachineList',
    [ h('.Frame_Header',
      [ $.lib.icon('server.fa-2x')
      , h('strong', 'Machine List' )
      , h('.Frame_Close', { onclick: close }, '×')
      ])
    , machines.map(machine)
    , h('.Frame_Section.Machine_Add', { onclick: add }, '+ add machine...')
    ]);

  function close () {}

  function add () {}

}

function machine (data) {

  return h('.Frame_Section.Machine',
    [ $.lib.icon(data.icon + '.fa-2x')
    , data.label ]);

}
