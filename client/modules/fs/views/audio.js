var path = require('path')
  , vdom = require('virtual-dom');

module.exports = function (id, src) {
  return require('vdom-thunk')(module.exports.widget, id, src);
}

module.exports.widget = function (id, src) {

  var Sound    = App.Model.Sound
    , playerId = id + '_' + src;

  return {

    type: "Widget"

  , init: function () {
      this.element = vdom.create(this.render(Sound()));
      Sound(this.patch.bind(this));
      return this.element;
    }

  , update: function (prev, el) {
      console.debug('update', prev, el);
      this.element  = this.element  || prev.element;
    }

  , destroy: function (el) {
      console.debug('destroy', el);
      var player = Sound.Players.get(playerId);
      if (player) player.stop();
    }

  , patch: function (state) {
      this.element = vdom.patch(this.element,
        vdom.diff(this._vdom, this.render(state)));
    }

  , render: function (state) {

      var self = this;

      return this._vdom = h('.AudioPlayer',
        [ h('.AudioPlayer_Toolbar',
          [ h('button.AudioPlayer_Button_Play', { onclick: play }, '⏯')
          , h('button.AudioPlayer_Button_Cue', { onclick: stop }, 'CUE') ])
        , h('.AudioPlayer_Header', { style: { display: 'flex' } },
            [ $.lib.icon('volume-up.fa-2x')
            , h('.AudioPlayer_Title', require('path').basename(src))
            , h('.AudioPlayer_Position', '\nloading\n')
            , h('.FrameClose', { onclick: remove }, '×')
            , h('.AudioPlayer_ProgressBar',
                h('.AudioPlayer_ProgressBar_Background',
                  h('.AudioPlayer_ProgressBar_Foreground'))) ])
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
          ]);

      function play () {
        var player = Sound.Players.get(playerId);
        if (player && player()) {
          player = player();
          if (player.status === 'playing') {
            player.stop();
          } else {
            player.play();
          }
        } else {
          console.warn("can not play", playerId);
        }
      }

      function stop () {
        var player = Sound.Players.get(playerId);
        if (player && player()) {
          player = player();
          player.stop().then(function () { player.seek(0) })
        } else {
          console.warn("can not stop", playerId);
        }
      }

      function cue (number, label, time) {
        return h('.AudioPlayer_Cue',
          [ h('.AudioPlayer_Cue_Label',
            [ h('.AudioPlayer_Cue_Number', number)
          , label ])
        , h('.AudioPlayer_Cue_Time', time) ])
      }

      function remove () {
        $.modules.workspace.remove(index);
      }
    }

  , loadVoices: function (src) {
      var self     = this
        , player   = this.player = $.modules.sound.player(src)
        , button   = getControl('Button_Play')
        , bar      = getControl('ProgressBar_Background')
        , barFg    = getControl('ProgressBar_Foreground')
        , position = getControl('Position');

      player.onupdate = function (player) {
        progress(player.position, player.duration);
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
        player.seek(scrub(event));
      }

      function scrubStop (event) {
        bar.onmousemove = bar.onmouseup = null;
        player.seek(scrub(event));
      }

      function scrub (event) {
        var bg   = getControl('ProgressBar_Background')
          , rect = bg.getBoundingClientRect()
          , pos  = (event.clientX - rect.left) / rect.width
        progress(pos * player.duration, player.duration);
        return pos * player.duration;
      }

      function getControl (cls) {
        return self.element.getElementsByClassName('AudioPlayer_' + cls)[0];
      }

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
    var opts   = { width: self.element.offsetWidth, height: 72, samples: self.element.offsetWidth
                 , colors: { waveform: '#ccc', waveformHover: '#ccc' }}
      , viewer = require('waveform-viewer')(opts);
    viewer.appendTo(self.element.firstChild);
    viewer.load(self.data);
  }, 1)
}
