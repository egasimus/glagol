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
          [ h('.AudioPlayer_Button_Play', '⏯')
          , h('.AudioPlayer_Button_Cue', 'CUE')
          , h('.AudioPlayer_Title', require('path').basename(src))
          , h('.AudioPlayer_Position', 'stopped')
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
      var self     = this
        , player   = this.player = $.modules.sound.player(src)
        , button   = getControl('Button_Play')
        , bar      = getControl('ProgressBar_Background')
        , barFg    = getControl('ProgressBar_Foreground')
        , position = getControl('Position')
        , duration = null;;

      player.onupdate = function (pos, dur) {
        duration = dur;
        progress(pos, dur);
      }

      bar.onmousedown = scrubStart;
      button.classList.remove('playing');
      button.onclick = play;

      function play () {
        self.player.play();
        button.classList.add('Playing');
        button.onclick = pause;
      }

      function pause () {
        self.player.stop();
        button.classList.remove('Playing');
        button.onclick = play;
      }

      function progress (pos, dur) {
        barFg.style.width = pos / dur * 100 + '%';
        position.innerText =
          $.lib.formatTime(pos)       + "\n" +
          $.lib.formatTime(dur - pos) + "\n" +
          $.lib.formatTime(dur);
      }

      function scrubStart (event) {
        bar.onmousemove = scrub;
        bar.onmouseup = scrubStop;
        scrub(event);
      }

      function scrubStop (event) {
        bar.onmousemove = bar.onmouseup = null;
        scrub(event);
      }

      function scrub (event) {
        var bg   = getControl('ProgressBar_Background')
          , rect = bg.getBoundingClientRect()
          , pos  = (event.clientX - rect.left) / rect.width
        progress(pos * duration, duration);
        player.seek(pos * duration);
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
      if (this.player) this.player.stop();
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
