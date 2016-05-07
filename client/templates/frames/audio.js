module.exports = function (state) {
  return require('vdom-thunk')(module.exports.widget, state);
}

module.exports.widget = require('virtual-widget')(
  { init: function (src) {

      var self = this;

      //this.canvas = document.createElement('canvas');

      this.controls = require('virtual-dom/create-element')(
        h('.AudioPlayer',
          [ h('.AudioPlayer_Button', { onclick: playback }, '▶')
          , h('.AudioPlayer_Info', require('path').basename(src))
          //, h('.AudioPlayer_Waveform')
          ]));

      if (this.data) {
        renderViewer()
      } else {
        var request = new XMLHttpRequest()
          , src     = 'http://localhost:1615/file?path=' + src
          , parent  = this.controls;
        request.open('GET', src, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
          self.data = request.response;
          renderViewer();
        }
        request.send();
      }

      function playback (event) {
        event.preventDefault();
      }

      return this.controls;

      function renderViewer () {
        setTimeout(function () {
          var opts   = { width: self.controls.offsetWidth, height: 72, samples: self.controls.offsetWidth
                       , colors: { waveform: '#ccc', waveformHover: '#ccc' }}
            , viewer = require('waveform-viewer')(opts);
          viewer.appendTo(self.controls);
          viewer.load(self.data);
        }, 1)
      }

    }

  , update: function (prev, el) {
      this.canvas   = this.canvas   || prev.canvas;
      this.controls = this.controls || prev.controls;
    }

  , destroy: function (el) {
    }

  })

function getData (src, parent) {
}
