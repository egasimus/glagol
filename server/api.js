module.exports = function (id) {
  return {

    subscribe: function subscribe (cb) {
      if (cb) _.model(function (val) { cb(serialize(val)) });
      return serialize(_.model());
    },

    add: function add (type, address) {
      _model.sessions.put(address, { type: type, address: address });
      $.log('added', type, 'at', address);
      return address;
    },

    remove: function remove (address) {
      console.log('remove', address);
      _.model.sessions.delete(address);
    },

  }
};

function serialize (data) {
  return JSON.stringify(data, function (key, val) {
    if (key === 'socket' || key === 'api') return undefined;
    return val;
  });
}
