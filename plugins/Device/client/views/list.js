module.exports = function (state, index) {

  var devices =
    [ { label: 'hostname (localhost)',        icon: 'laptop' }
    , { label: 'remotehost (163.45.72.5)',    icon: 'server' }
    , { label: 'remotehost2 (42.64.133.122)', icon: 'server' } ];

  return h('.DeviceList',
    [ h('.Frame_Header',
      [ $.lib.icon('database.fa-2x')
      , h('strong', 'Device List' )
      , h('.Frame_Close', { onclick: close }, '×')
      ])
    , devices.map(device)
    ]);

  function close () {}

  function add () {}

}

function device (data) {

  return h('.Frame_Section.Device',
    [ $.lib.icon(data.icon + '.fa-2x')
    , data.label ]);

}
