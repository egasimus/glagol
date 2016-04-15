(function (state) {

  return h('.TabBar',
    Object.keys(state.sessions).map(function (id) {
      var session = state.sessions[id] || {}
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
          $.commands.updateSession(
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
