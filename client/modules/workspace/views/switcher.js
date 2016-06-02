(function (state) {

  if (!state.Workspace.Switcher.visible) return h('.Switcher.Hidden');

  var Switcher = App.Model.Workspace.Switcher;

  return h('.Switcher.Visible', state.Workspace.Frames.map(function (frame, i) {
    return h('.Switcher_Frame', [ i, frame.id, frame.type, frame.address ])
  }))

  return;

  return h('.TabBar',
    Object.keys(state.visibleFrames).map(function (id) {
      var session = state.visibleFrames[id] || {}
        , address = String(session.address);
      return h('.Tab.Active',
        { dataset: { address: address }
        , onclick: focusSession },
        [ h('.TabText', address)
        , (state.sockets[address]
          && state.sockets[address].status === 'connected')
          ? h('.TabConnected',    { onclick: disconnect })
          : h('.TabNotConnected', { onclick: connect    })
        , h('button.TabClose',    { onclick: remove     }, '×') ]);
    }).concat([ h('.TabAdd', '+') ]));

  function focusSession (event) {
    App.model.put('focusedSession', getAddress(event)); }

  function connect (event) {
    var address = getAddress(event);
    $.commands.connect(address).then(function (socket) {
      socket.addEventListener('message', function (message) {
        if (message.data.indexOf('update%') === 0)
          $.modules.workspace.update(
            address, JSON.parse(message.data.slice(7))) });
      socket.send('subscribe'); }); }

  function disconnect (event) {
    $.commands.disconnect(getAddress(event)); }

  function remove (event) {
    $.commands.remove(getAddress(event)); }

  function getAddress (event) {
    event.preventDefault();
    return event.target.dataset.address ||
      event.target.parentElement.dataset.address; }

})
