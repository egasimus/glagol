(function disconnect (address) {

  API('disconnect', address).done(
    function () {
      console.debug('disconnected from', address)
    },
    function (err) {
      console.debug('could not disconnect from', address, err);
    })

})
