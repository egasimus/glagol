(function (frame, index) {

  var type = frame.type === 'file'
    ? (App.Model.FS.Files()[frame.address] || {}).type || 'file'
    : frame.type

  return h('header.Frame_Header',
    [ h('.Frame_Title', type)
    , h('input.Frame_Address',
      { onchange: changeAddress
      , value:    frame.address })
    , h('.Frame_Close', { onclick: close }, '×')]);

  function changeAddress (event) {
    event.preventDefault();
    API('change', index, 'address', event.target.value);
  }

  function close (event) {
    event.preventDefault();
    __.close(index);
  }

})
