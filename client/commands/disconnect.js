(function disconnect (address) {

  return new Promise(
    function (win, fail) {
      API('disconnect', address).done(
        function () {
          console.debug('disconnected from', address)
          win(address);
        },
        function (err) {
          console.debug('could not disconnect from', address, err);
          fail(address, err);
        }) })

})
