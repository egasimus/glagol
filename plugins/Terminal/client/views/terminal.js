var Terminal = require('terminal.js')

module.exports = function (frame, index) {

  return h('.TerminalFrame',
    [ h('.Frame_Header',
      [ $.lib.icon('terminal.fa-2x')
      , h('strong', 'Terminal' )
      , h('.Frame_Close', { onclick: close }, '×') ])
    , h('.Terminal', { hookScroll: TerminalHook(frame.id) }) ]);

}

function TerminalHook (id) {

  return require('virtual-hook')(
    { hook: function (element) {
        console.debug('attaching terminal, id', id);
        setTimeout(function () {
          if (!__.model()[id]) {
            console.debug('opening new terminal, id', id);
            __.model.put(id, new Terminal({ cols: 80, rows: 25 }))
          } else {
            console.debug('found terminal, id', id);
          }
        }, 0);
      }
    , unhook: function (element) {
        console.debug('detaching terminal, id', id);
      } })

}
