(function init () {

  function onmessage (message) {
    var data = JSON.parse(message.data)
    console.debug("FS update", data)
    _.update(data);
  }

})
