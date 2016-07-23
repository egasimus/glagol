module.exports = function (state, index) {

  var services =
    [ { label: 'hostname (localhost)',        icon: 'laptop' }
    , { label: 'remotehost (163.45.72.5)',    icon: 'server' }
    , { label: 'remotehost2 (42.64.133.122)', icon: 'server' } ];

  return h('.ServiceList',
    [ h('.Frame_Header',
      [ $.lib.icon('th-large.fa-2x')
      , h('strong', 'Service List' )
      , h('.Frame_Close', { onclick: close }, '×')
      ])
    , services.map(service)
    ]);

  function close () {}

  function add () {}

}

function service (data) {

  return h('.Frame_Section.Service',
    [ $.lib.icon(data.icon + '.fa-2x')
    , data.label ]);

}
