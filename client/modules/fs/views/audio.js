var create = require('virtual-dom/create-element');

module.exports = function (state) {
  return require('vdom-thunk')(module.exports.widget, state);
}

module.exports.widget = require('virtual-widget')(
  { init: function (src) {

      console.debug('init', src);

      var self  = this
        , ctx   = App.Model.Sound.context()

      //this.canvas = document.createElement('canvas');

      this.controls = create(
        h('.AudioPlayer',
          [ 
          //, h('.AudioPlayer_Waveform')
            h('.AudioPlayer_Button', '⏯')
          , h('.AudioPlayer_Position', 'paused')
          , h('.AudioPlayer_Title', require('path').basename(src))
          , h('.AudioPlayer_ProgressBar',
              h('.AudioPlayer_ProgressBar_Background',
                h('.AudioPlayer_ProgressBar_Foreground')))
          //, h('.AudioPlayer_Cues',
            //[ h('.AudioPlayer_Cue', [ h('strong', '01'), ' 00:00:00' ])
            //, h('.AudioPlayer_Cue', [ h('strong', '02'), ' 00:00:11' ])
            //, h('.AudioPlayer_Cue', [ h('strong', '03'), ' 00:00:42' ])
            //, h('.AudioPlayer_Cue', [ h('strong', '04'), ' 00:01:01' ])
            //, h('.AudioPlayer_Cue', [ h('strong', '05'), ' 00:01:08' ])
            //, h('.AudioPlayer_Cue', [ h('strong', '06'), ' 00:01:11' ])
            //, h('.AudioPlayer_Cue', [ h('strong', '07'), ' 00:01:31' ])
            //, h('.AudioPlayer_Cue', [ h('strong', '08'), ' 00:02:44' ])
            //])
          , h('canvas.AudioPlayer_Spectrogram')
          ]));

      if (this.data) {
        renderWaveform()
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
        ctx.decodeAudioData(self.data).then(dataDecoded)
        //renderWaveform();
      }

      function dataDecoded (audioBuffer) {
        console.debug('decoded', audioBuffer);
        createVoice(audioBuffer);
        //var spectrogram = self.controls.lastChild;
        //drawSpectrogram(spectrogram, audioBuffer);
        //var spectrogram = require('spectrogram')(
          //self.controls.getElementsByTagName('canvas')[0],
          //{ audio: { enable: false }})
        //spectrogram.connectSource(audioBuffer, ctx);
        //spectrogram.start();
      }

      function createVoice (audioBuffer) {
        var audio = ctx.createBufferSource();
        audio.buffer = audioBuffer || self.audio.buffer;
        self.audio = audio;
        audio.connect(ctx.destination);
        self.startedAt = null;
        if (self.timer) clearInterval(self.timer);
        var button = self.controls.getElementsByClassName('AudioPlayer_Button')[0];
        button.classList.remove('Playing')
        button.onclick = play;
      }

      function play (event) {
        self.startedAt = ctx.currentTime;
        self.timer = setInterval(update, 20);
        self.audio.start(0, 0);
        self.audio.onended = createVoice.bind(null, null);
        var button = self.controls.getElementsByClassName('AudioPlayer_Button')[0];
        button.classList.add('Playing')
        button.onclick = pause;
      }

      function pause (event) {
        if (self.timer) {
          self.audio.stop();
          self.timer = clearInterval(self.timer)
        }
        createVoice();
        var position = self.controls.getElementsByClassName('AudioPlayer_Position')[0];
        position.innerText = 'paused';
      }

      function update () {
        var pos = ctx.currentTime - self.startedAt
          , dur = self.audio.buffer.duration
          , position = self.controls.getElementsByClassName('AudioPlayer_Position')[0]
          , progress = self.controls.getElementsByClassName('AudioPlayer_ProgressBar_Foreground')[0]
        position.innerText = formatTime(pos) + ' / ' + formatTime(dur);
        progress.style.width = pos / dur * 100 + '%';
      }

      function formatTime (t) {
        return String(Math.round(t * 1000) / 1000);
      }

      return this.controls;

      function renderWaveform () {
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
      console.debug('update', prev, el);
      this.canvas   = this.canvas   || prev.canvas;
      this.controls = this.controls || prev.controls;
      this.data     = this.data     || prev.data;
      this.audio    = this.audio    || prev.audio;
    }

  , destroy: function (el) {
      console.debug('destroy', el);
      if (this.audio && this.timer) this.audio.stop();
    }

  })

function getData (src, parent) {
}

function drawSpectrogram (canvas, buffer) {
  var audioCtx = new OfflineAudioContext(
        buffer.numberOfChannels,
        buffer.length,
        buffer.sampleRate)
    , drawCtx  = canvas.getContext('2d')
    , source   = audioCtx.createBufferSource()
    , analyser = audioCtx.createAnalyser()
    , script   = audioCtx.createScriptProcessor(2048, 1, 1);

  source.buffer = buffer;
  source.connect(analyser);
  analyser.smoothingTimeConstant = 0;
  analyser.fftSize = 1024;
  analyser.connect(script);
  script.onaudioprocess = drawFrame;
  script.connect(audioCtx.destination);
  audioCtx.startRendering();

  var i = 0;

  function drawFrame (event) {
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    console.log("-->", ++i, array);
  }
}
