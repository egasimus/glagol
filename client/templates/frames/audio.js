module.exports = function (state) {
  return require('vdom-thunk')(module.exports.widget, state);
}

module.exports.widget = require('virtual-widget')(
  { init: function (src) {

      this.audio = document.createElement('audio');
      this.audio.src = 'http://localhost:1615/file?path=' + src;

      this.controls = require('virtual-dom/create-element')(
        h('.AudioPlayer',
          [ h('.AudioPlayerButton', { onclick: playback }, '▶')
       , h('.AudioPlayerInfo', require('path').basename(src)) ]));

      var self = this;
      function playback (event) {
        event.preventDefault();
        if (self.audio.paused) self.audio.play(); else self.audio.pause();
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
