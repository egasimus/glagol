(function (src) {

  var model = App.Model.Sound;

  return new Promise(function (win, fail) {

    var cached = model.buffers()[src]
      , request;

    if (cached) {
      win(cached);
    } else {
      request = new XMLHttpRequest();
      request.open('GET', '/file?path=' + src, true);
      request.responseType = 'arraybuffer';
      request.onload = loaded;
      request.onerror = function (e) { fail(e) };
      request.send();
    }

    function loaded () {
      model.context().decodeAudioData(request.response).then(decoded)
    }

    function decoded (data) {
      model.buffers.put(src, data);
      win(data);
    }

  })

})
