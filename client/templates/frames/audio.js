module.exports = function (state) {
  return require('vdom-thunk')(module.exports.widget, state);
}

module.exports.widget = require('virtual-widget')(
  { init: function (src) {

      var self = this
        , ctx  = App.Model.Sound.context();

      //this.canvas = document.createElement('canvas');

      this.controls = require('virtual-dom/create-element')(
        h('.AudioPlayer',
          [ h('.AudioPlayer_Waveform')
          , h('.AudioPlayer_Button', '▶')
          , h('.AudioPlayer_Info', require('path').basename(src))
          , h('.AudioPlayer_Cues',
            [ h('.AudioPlayer_Cue', [ h('strong', '01'), ' 00:00:00' ])
            , h('.AudioPlayer_Cue', [ h('strong', '02'), ' 00:00:11' ])
            , h('.AudioPlayer_Cue', [ h('strong', '03'), ' 00:00:42' ])
            , h('.AudioPlayer_Cue', [ h('strong', '04'), ' 00:01:01' ])
            , h('.AudioPlayer_Cue', [ h('strong', '05'), ' 00:01:08' ])
            , h('.AudioPlayer_Cue', [ h('strong', '06'), ' 00:01:11' ])
            , h('.AudioPlayer_Cue', [ h('strong', '07'), ' 00:01:31' ])
            , h('.AudioPlayer_Cue', [ h('strong', '08'), ' 00:02:44' ])
            ])
          ]));

      if (this.data) {
        renderViewer()
      } else {
        var request = new XMLHttpRequest()
          , src     = 'http://localhost:1615/file?path=' + src
          , parent  = this.controls;
        request.open('GET', src, true);
        request.responseType = 'arraybuffer';
        request.onload = dataLoaded;
        request.send();
      }

      function dataLoaded () {
        self.data = request.response;
        ctx.decodeAudioData(self.data).then(dataDecoded);
        renderViewer();
      }

      function dataDecoded (audioData) {
        self.audio = ctx.createBufferSource();
        self.audio.buffer = audioData;
        console.log(audioData, self.audio);
        self.audio.connect(ctx.destination);
        self.controls.getElementsByClassName('AudioPlayer_Button')[0].onclick = play;
      }

      function play (event) {
        self.audio.start(0, 1, 2);
        self.controls.getElementsByClassName('AudioPlayer_Button')[0].onclick = pause;
      }

      function pause (event) {
        self.audio.stop();
        self.controls.getElementsByClassName('AudioPlayer_Button')[0].onclick = play;
      }

      return this.controls;

      function renderViewer () {
        setTimeout(function () {
          var opts   = { width: self.controls.offsetWidth, height: 72, samples: self.controls.offsetWidth
                       , colors: { waveform: '#ccc', waveformHover: '#ccc' }}
            , viewer = require('waveform-viewer')(opts);
          viewer.appendTo(self.controls.firstChild);
          viewer.load(self.data);
        }, 1)
      }

    }

  , update: function (prev, el) {
      this.canvas   = this.canvas   || prev.canvas;
      this.controls = this.controls || prev.controls;
      this.data     = this.data     || prev.data;
      this.audio    = this.audio    || prev.audio;
    }

  , destroy: function (el) {
    }

  })

function getData (src, parent) {
}
