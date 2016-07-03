var path = require('path')
  , vdom = require('virtual-dom');

module.exports = function (id, src) {
  return require('vdom-thunk')(module.exports.widget, id, src);
}

module.exports.widget = function (id, src) {

  var model    = App.Model.Sound
    , playerId = id + '_' + src;

  return {

    type: "Widget"

  , init: function () {
      this.element = vdom.create(this.render(model()));
      model(this.patch.bind(this)); // TODO centralize to prevent hanging references
      return this.element;
    }

  , update: function (prev, el) {
      console.debug('player update', prev, el);
      this.element  = this.element  || prev.element;
      this.timer    = this.timer    || prev.timer;
    }

  , destroy: function (el) {
      console.debug('player destroy', el);
      var player = model.Players()[playerId];
      if (player) player.stop();
      if (this.timer) clearInterval(this.timer);
    }

  , patch: function (state) {
      this.element = vdom.patch(this.element,
        vdom.diff(this._vdom, this.render(state)));
    }

  , render: function (state) {

      var self   = this
        , player = state.Players ? state.Players[playerId] : null;

      if (!player) {
        return this._vdom = h('.AudioPlayer_Missing',
          [ 'No player'
          , h('em', playerId)
          ]);
      }

      //function progress (pos, dur) {
        //barFg.style.width = pos / dur * 100 + '%';
      //}

      return this._vdom = h('.AudioPlayer',
        [ h('.AudioPlayer_Section',
          [ h('button.AudioPlayer_Button_Play' + (player.status === 'playing' ? '.Playing' : ''),
              { onclick: play }, '⏯')
          , h('button.AudioPlayer_Button_Cue',
              { onclick: stop }, 'CUE')
          , h('.AudioPlayer_Position',
              player.status === 'loading'
              ? '\nloading\n'
              : $.lib.formatTime(player.position)                   + "\n" +
                $.lib.formatTime(player.duration - player.position) + "\n" +
                $.lib.formatTime(player.duration))
          , h('.AudioPlayer_Title', require('path').basename(src))
          , h('.Frame_Close', { onclick: close }, '×')
          ])

        , h('.AudioPlayer_Section',
          [ h('.AudioPlayer_ProgressBar',
              { onmousedown: seek },
              h('.AudioPlayer_ProgressBar_Background',
                h('.AudioPlayer_ProgressBar_Foreground',
                  { style: { width:
                    (player.position && player.duration)
                    ? player.position / player.duration * 100 + '%'
                    : 0 }})))
          ])
          //, h('.AudioPlayer_Waveform') ])

        , h('.AudioPlayer_Section',
          { style: { flexWrap: 'nowrap' } },
          [ h('.AudioPlayer_Cues',
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
              [ h('.AudioPlayer_Info_Toggle'
              , $.lib.icon('info-circle')) ])
            , h('table.AudioPlayer_Info_Table',
                Object.keys(model.Metadata()[src] || {}).sort().map(tag))])

          ])

          //, h('canvas.AudioPlayer_Spectrogram')
          ]);

      function play () {
        var player = model.Players.get(playerId);
        if (player && player()) {
          player = player();
          if (player.status === 'playing') {
            player
              .stop()
              .then(function () {
                self.timer = clearInterval(self.timer);
                update(); })
          } else {
            player
              .play()
              .then(function () {
                self.timer = setInterval(update, 1000 / 30);
                update() });
          }
        } else {
          console.warn("can not play", playerId);
        }
      }

      function stop () {
        var player = model.Players.get(playerId);
        if (player && player()) {
          player = player();
          player
            .stop()
            .then(function () {
              self.timer = clearInterval(self.timer);
              player.seek(0);
              update() });
        } else {
          console.warn("can not stop", playerId);
        }
      }

      function seek (event) {
        var player = model.Players.get(playerId);
        if (player && player()) {
          player = player();
          var cls  = 'AudioPlayer_ProgressBar_Background'
            , bg   = event.currentTarget.getElementsByClassName(cls)[0]
            , rect = bg.getBoundingClientRect()
            , pos  = (event.clientX - rect.left) / rect.width;
          player
            .seek(pos * player.duration)
            .then(update);
        }
      }

      function update () {
        // trigger update via model
        model.Players.put(playerId, model.Players()[playerId]);
      }

      function cue (number, label, time) {
        return h('.AudioPlayer_Cue',
          [ h('.AudioPlayer_Cue_Label',
            [ h('.AudioPlayer_Cue_Number', number)
          , label ])
        , h('.AudioPlayer_Cue_Time', time) ])
      }

      function tag (id) {
        var val = (model.Metadata()[src] || {})[id] || '';
        return h('tr',
          [ h('td', { style: { fontWeight:   'bold'
                             , paddingRight: '12px' } }, id)
          , h('td', { style: { whiteSpace: 'nowrap' } }, val) ])
      }

      function close () {
        App.API('Workspace/Close', id);
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
