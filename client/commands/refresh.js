(function (frame, index) {

  console.log("refresh", frame)

  API('refresh', index).catch(
    function (err) { console.error('could not refresh frame', index, frame)})

})
