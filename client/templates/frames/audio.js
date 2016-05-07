module.exports = function (state) {
  return require('vdom-thunk')(module.exports.widget, state);
}

module.exports.widget = require('virtual-widget')(
  { init: function (src) {

      //this.canvas = document.createElement('canvas');

      this.controls = require('virtual-dom/create-element')(
        h('.AudioPlayer',
          [ h('.AudioPlayer_Button', { onclick: playback }, '▶')
          , h('.AudioPlayer_Info', require('path').basename(src))
          //, h('.AudioPlayer_Waveform')
          ]));
      //this.controls.lastChild.appendChild(this.canvas);

      getData(src, this.controls);

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

function getData (src, parent) {
  var request = new XMLHttpRequest()
    , src     = 'http://localhost:1615/file?path=' + src
  request.open('GET', src, true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
    var data = request.response;
    console.log('decode', data);
    //Sound.context.decodeAudioData(data, function (buffer) {
      var options =
          { width:   parent.offsetWidth
          , height:  100
          , samples: parent.offsetWidth
          , colors: { waveform: '#222', waveformHover: '#ddd' }}
        , viewer = require('waveform-viewer')(options);
      viewer.appendTo(parent);
      viewer.load(data);
    //})
  }
  request.send();
}
