var create = require('virtual-dom/create-element');

module.exports = function (state) {
  return require('vdom-thunk')(module.exports.widget, state);
}

module.exports.widget = function (src) {
  return {
    type: "Widget"
  , init: function () {
      console.debug('init audio player', src, this);
      this.controls = this.render()
      this.load('//localhost:1615/file?path='+src);
      return this.controls;
    }
  , render: function () {
      return create(
        h('.AudioPlayer',
          [
          //, h('.AudioPlayer_Waveform')
            h('.AudioPlayer_Button', '⏯')
          , h('.AudioPlayer_Title', require('path').basename(src))
          , h('.AudioPlayer_Position', 'paused')
          , h('.AudioPlayer_ProgressBar',
              h('.AudioPlayer_ProgressBar_Background',
                h('.AudioPlayer_ProgressBar_Foreground')))
          , h('.AudioPlayer_Cues',
            [ h('.AudioPlayer_Cues_Toolbar',
              [ h('.AudioPlayer_Cues_Add', $.lib.icon('map-marker')) ])
            , h('.AudioPlayer_Cues_List',
              [ cue('1', 'Fade in',     '00:00:11')
              , cue('2', 'First beat',  '00:00:42')
              , cue('3', 'Theme',       '00:01:01')
              , cue('4', 'Verse',       '00:01:08')
              , cue('5', 'Chorus',      '00:01:11')
              , cue('6', 'Breakdown',   '00:01:31')
              , cue('7', 'Phrase',      '00:02:44')
              ])
            ])
          , h('.AudioPlayer_Info',
            [ h('.AudioPlayer_Info_Toolbar',
              [ h('.AudioPlayer_Info_Toggle', $.lib.icon('info-circle')) ])])
            //, h('canvas.AudioPlayer_Spectrogram')
            ]));

        function cue (number, label, time) {
          return h('.AudioPlayer_Cue',
            [ h('.AudioPlayer_Cue_Label',
              [ h('.AudioPlayer_Cue_Number', number)
            , label ])
          , h('.AudioPlayer_Cue_Time', time) ])
      }
    }

  , load: function (src) {
      var self  = this
        , voice = $.modules.sound.voice;
      this.voice1 = voice(src);
      this.voice2 = voice(src);
      this.voice1.update = this.voice2.update = update;
      var button   = getControl('Button')
        , position = getControl('Position')
        , progress = getControl('ProgressBar_Foreground');
      button.classList.remove('playing');
      button.onclick = play;

      function getControl (cls) {
        return self.controls.getElementsByClassName('AudioPlayer_' + cls)[0];
      }

      function play () {
        self.voice1();
        button.classList.add('Playing');
        button.onclick = pause;
      }

      function pause () {
        self.voice1.stop();
        self.voice1 = self.voice2;
        self.voice2 = $.modules.sound.voice(src);
        button.classList.remove('Playing');
        button.onclick = play;
      }

      function update (voice) {
        var pos = App.Model.Sound.context().currentTime - voice.startedAt
          , dur = voice.buffer.duration
        position.innerText =
          $.lib.formatTime(pos) + "\n" +
          $.lib.formatTime(dur) + "\n" +
          $.lib.formatTime(dur - pos);
        progress.style.width = pos / dur * 100 + '%';
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

  }
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

function renderWaveform () {
  setTimeout(function () {
    var opts   = { width: self.controls.offsetWidth, height: 72, samples: self.controls.offsetWidth
                 , colors: { waveform: '#ccc', waveformHover: '#ccc' }}
      , viewer = require('waveform-viewer')(opts);
    viewer.appendTo(self.controls.firstChild);
    viewer.load(self.data);
  }, 1)
}
