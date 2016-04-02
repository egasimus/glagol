module.exports = function (id) {
  return {

    subscribe: function subscribe (cb) {
      if (cb) _.model(function (val) { cb(serialize(val)) });
      return serialize(_.model());
    },

    connect: function connect (address) {
      var fragments = (address || '').split(':')
        , fullAddress = '';
      switch (fragments.length) {
        case 2:
          fullAddress = 'ws://' + fragments[0] + ':' + fragments[1];
          break;
        case 1:
          fullAddress = 'ws://localhost:' + fragments[0];
          break;
        default:
          fullAddress = address;
          break;
      }
      console.log("adding debug session at: " +
        fullAddress +
        (fullAddress !== address ? ' (parsed from ' + address + ')' : ""));
      _.model.sessions.put(fullAddress, { address: fullAddress });
      return fullAddress;
    },

    disconnect: function disconnect (address) {
      console.log("removing debug session at", address);
      _.model.sessions.delete(address);
    },

    fetch: function fetch (address) {
      console.log("fetching data for", address);
      return new Promise(function (win, fail) {
        win(JSON.stringify(
          { 'foo/':  '1234'
          , '  bar': '5678'
          , '  baz': '9101112' }))
      })
    }

  }
};

function serialize (data) {
  return JSON.stringify(data, function (key, val) {
    if (key === 'socket' || key === 'api') return undefined;
    return val;
  });
}
