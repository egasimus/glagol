module.exports = function (frame, index) {

  return h('header.Frame_Header',
    [ h('a',
        __.icons[frame.type]
          ? $.lib.icon(__.icons[frame.type] + '.fa-2x')
          : h('em', frame.type))
    , h('input.Frame_Address',
        { onchange: changeAddress
        , value:    frame.address })
    , h('button.Frame_Reload',
        { onclick:  reload }, $.lib.icon('refresh'))
    , h('.Frame_Close',
        { onclick:  close }, '×') ]);

  function changeAddress (event) {
    event.preventDefault();
    API('change', index, 'address', event.target.value);
  }

  function reload (event) {
    event.preventDefault();
  }

  function close (event) {
    event.preventDefault();
    __.close(index);
  }

}
