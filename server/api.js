module.exports = function (id) {
  return {

    subscribe: function subscribe (cb) {
      if (cb) $.model(function (val) { cb(serialize(val)) });
      return serialize($.model());
    },

    add: function add (type, address) {
      $.model.frames.push({ type: type, address: address });
      $.log('add', type, 'at', address);
      return address;
    },

    remove: function remove (index) {
      $.log('remove', index);
      $.model.frames.splice(index, 1);
    },

  }
};

function serialize (data) {
  return JSON.stringify(data, function (key, val) {
    if (key === 'socket' || key === 'api') return undefined;
    return val;
  });
}
