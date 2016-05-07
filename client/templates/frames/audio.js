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
      this.canvas   = this.canvas   || prev.canvas;
      this.controls = this.controls || prev.controls;
    }

  , destroy: function (el) {
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
      var width  = canvas.width
        , middle = canvas.height / 2
        , data   = buffer.getChannelData(0)
        , step   = Math.ceil(data.length / width)
        , ctx    = canvas.getContext('2d')
      ctx.fillStyle = '#555';
      //for (var i = 0; i < width; i += 1) {
        //var min =  1.0
          //, max = -1.0;
        //for (var j = 0; j < step; j += 1) {
          //var datum = data[(i * step) + j];
          //if (datum < min) {
            //min = datum;
          //} else if (datum > max) {
            //max = datum;
          //}
          //ctx.fillRect(i, (1 + min) * middle, 1, Math.max(1, (max - min) * middle));
        //}
      //}
    })
  }
  request.send();
}
