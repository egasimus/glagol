module.exports = function (state) {
  return require('vdom-thunk')(module.exports.widget, state);
}

module.exports.widget = require('virtual-widget')(
  { init: function (src) {

      this.canvas = document.createElement('canvas');

      getData(src, this.canvas);

      this.controls = require('virtual-dom/create-element')(
        h('.AudioPlayer',
          [ h('.AudioPlayer_Button', { onclick: playback }, '▶')
          , h('.AudioPlayer_Info', require('path').basename(src))
          , h('.AudioPlayer_Waveform') ]));
      this.controls.lastChild.appendChild(this.canvas);

      function playback (event) {
        event.preventDefault();
      }

      return this.controls;

    }

  , update: function (prev, el) {
      this.audio = this.audio || prev.audio;
    }

  , destroy: function (el) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
      delete this.audio;
    }

  })

function getData (src, canvas) {
  var request = new XMLHttpRequest()
    , src     = 'http://localhost:1615/file?path=' + src
  request.open('GET', src, true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
    var data = request.response;
    Sound.context.decodeAudioData(data, function (buffer) {
      console.log(buffer);
    })
  }
  request.send();
}
