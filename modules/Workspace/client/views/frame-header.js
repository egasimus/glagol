(function (frame, index) {

  var type = frame.type === 'file'
    ? (App.Model.FS.Files()[frame.address] || {}).type || 'file'
    : frame.type

  return h('header.FrameHeader',
    [ h('.FrameTitle', type)
    , h('input.FrameAddress',
      { onchange: changeAddress
      , value:    frame.address })
    , h('.FrameClose', { onclick: remove }, '×')]);

  function changeAddress (event) {
    event.preventDefault();
    API('change', index, 'address', event.target.value);
  }

  function remove (event) {
    event.preventDefault();
    __.remove(index);
  }

})
