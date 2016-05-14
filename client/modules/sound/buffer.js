(function (src) {
  return new Promise(function (win, fail) {
    var request = new XMLHttpRequest();
    request.open('GET', src, true);
    request.responseType = 'arraybuffer';
    request.onload = function loaded () {
      App.Model.Sound.context().decodeAudioData(request.response).then(win);
    };
    request.onerror = function (e) { fail(e) };
    request.send();
  })
})
