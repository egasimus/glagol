(function (type, address) {

  var fragments = (address || "").split(':').length;
  address = fragments === 3 ?
              address.trim()
          : fragments === 2 ?
              ('ws://' + address.trim())
          : fragments === 1 ?
              address.trim()
              ? ('ws://localhost:' + address.trim())
              : null
          : null;
  if (!address) throw Error('address must be: [[ws://]<HOST>]<PORT>');

  console.debug('adding', type, 'at', address);

  console.log(address);

  //API('add', type, address).done(init);

})
