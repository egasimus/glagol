module.exports = function () {

  return h('.TerminalFrame',
    [ h('.Frame_Header',
      [ $.lib.icon('terminal.fa-2x')
      , h('strong', 'Terminal' )
      , h('.Frame_Close', { onclick: close }, '×')
      ])
    , h('.Terminal')
    ]);

}
