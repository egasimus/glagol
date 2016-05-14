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
      this.loadVoices('//localhost:1615/file?path=' + src);
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
              [ cue('1', 'Fade in',    '00:11.111')
              , cue('2', 'First beat', '00:42.424')
              , cue('3', 'Theme',      '01:01.010')
              , cue('4', 'Verse',      '01:08.080')
              , cue('5', 'Chorus',     '01:11.111')
              , cue('6', 'Breakdown',  '01:31.313')
              , cue('7', 'Phrase',     '02:44.444')
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

  , loadVoices: function (src) {
      var self   = this
        , player = this.player = $.modules.sound.player(src);

      player.onupdate = function (pos, dur) {
        console.log(pos, dur)
        getControl('Position').innerText =
          $.lib.formatTime(pos)       + "\n" +
          $.lib.formatTime(dur - pos) + "\n" +
          $.lib.formatTime(dur);
        getControl('ProgressBar_Foreground').style.width =
          pos / dur * 100 + '%';
      }

      getControl('ProgressBar_Background').onclick = function (event) {
        var x1   = event.clientX
          , rect = getControl('ProgressBar_Background').getBoundingClientRect()
          , x2   = rect.left
          , x3   = rect.width;
        console.log((x1 - x2) / x3);
      }

      var button = getControl('Button')
      button.classList.remove('playing');
      button.onclick = play;

      function play () {
        self.player.play();
        button.classList.add('Playing');
        button.onclick = pause;
      }

      function pause () {
        self.player.pause();
        button.classList.remove('Playing');
        button.onclick = play;
      }

      function getControl (cls) {
        return self.controls.getElementsByClassName('AudioPlayer_' + cls)[0];
      }

    }

  , update: function (prev, el) {
      console.debug('update', prev, el);
      this.canvas   = this.canvas   || prev.canvas;
      this.controls = this.controls || prev.controls;
      this.player   = this.player   || prev.player;
    }

  , destroy: function (el) {
      console.debug('destroy', el);
      if (this.player) this.player.pause();
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
