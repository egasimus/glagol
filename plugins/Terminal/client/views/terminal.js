var Terminal = require('xterm')

module.exports = function (frame, index) {

  return h('.TerminalFrame',
    [ h('.Frame_Header',
      [ $.lib.icon('terminal.fa-2x')
      , h('strong', 'Terminal' )
      , h('.Frame_Close', { onclick: close }, '×') ])
    , h('.Terminal', { hookScroll: TerminalHook(frame.id) }) ]);

  function close () {}

}

function TerminalHook (id) {

  return require('virtual-hook')(
    { hook: function (element) {

        console.debug('attaching terminal, id', id);

        var terminal = __.model()[id];

        if (!terminal) {
          console.debug('opening new terminal, id', id);
          __.model.put(id, terminal = new Terminal());
          terminal.write('hello planetke')
        } else {
          console.debug('found terminal, id', id);
        }

        setTimeout(function () {
          terminal.open(element);
          console.debug('attached terminal, id', id, terminal, 'to', element);
          require('xterm/addons/fit').fit(terminal);
        }, 0);

      }

    , unhook: function (element) {

        console.debug('detaching terminal, id', id);
        var terminal = __.model()[id];
        if (terminal) {
          terminal.destroy();
          __.model.put(id, null)
        }

      } })

}
