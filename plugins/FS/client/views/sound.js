var path = require('path')
  , vdom = require('virtual-dom');

module.exports = _.loading(function (frame, index, file) {
  var playerId = frame.id + '_' + file.path;
  if (!App.Model.Sound.Players()[playerId])   loadAudioPlayer(file.path, playerId);
  if (!App.Model.Sound.Metadata()[file.path]) loadAudioMetadata(file.path);
  //if (!App.Model.Sound.Spectrograms()[file.path]) loadSpectrogram(file.path);
  //if (!App.Model.Sound.Waveforms()[file.path])    loadWaveform(file.path);
  return require('vdom-thunk')(module.exports.widget, frame.id, file.path);
});

module.exports.widget = widget;

function loadAudioPlayer (src, playerId) {
  setTimeout(function () {
    App.Model.Sound.Players.put(playerId, $.plugins.Sound.devices.player(src))
  }, 0);
}

function loadAudioMetadata (src) {
  setTimeout(function () {
    App.Model.Sound.Metadata.put(src, 'loading');
    var url = '/api/Sound/GetMetadata?' + JSON.stringify([src])
      , xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      App.Model.Sound.Metadata.put(src, JSON.parse(xhr.response).data);
    }
    xhr.onerror = function () {
      App.Model.Sound.Metadata.put(src, 'failed');
    }
    xhr.send();
  })
}

function widget (id, src) {

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
        , player = state.Players ? state.Players[playerId] : null
        , cues   = state.Cues    ? state.Cues[src] || []   : [];

      if (!player) {
        return this._vdom = h('.AudioPlayer_Missing',
          [ 'No player '
          , h('em', playerId)
          ]);
      }

      player.onupdate = update;

      var knob = __.__.Control.views.knob
        , showCues = false
        , showInfo = false;

      return this._vdom = h('.AudioPlayer',
        [ header()
        , progressBar()
        , controlBar()
        , showCues ? cues() : null
        , showInfo ? info() : null ]);

      // templates

      function header () {
        return h('.Frame_Header',
          [ h('button.AudioPlayer_Button_Play' + (player.status === 'playing' ? '.Playing' : ''),
              { onclick: play }, '⏯')
          , h('button.AudioPlayer_Button_Cue',
              { onclick: stop }, 'CUE')
          , h('.AudioPlayer_Position',
              player.status === 'loading'
              ? '\nloading\n'
              : $.lib.formatTime(player.position)                                + "\n" +
                $.lib.formatTime(Math.max(player.duration - player.position, 0)) + "\n" +
                $.lib.formatTime(player.duration))
          , h('.AudioPlayer_Title', require('path').basename(src))
          , h('.Frame_Close', { onclick: close }, '×') ]) }

      function progressBar () {
        return h('.AudioPlayer_Section',
          [ h('.AudioPlayer_ProgressBar',
              { onmousedown: seek },
              h('.AudioPlayer_ProgressBar_Background',
                h('.AudioPlayer_ProgressBar_Foreground',
                  { style: { width:
                    (player.position && player.duration)
                    ? player.position / player.duration * 100 + '%'
                    : 0 }}))) ]) }

      function controlBar () {
        return h('.AudioPlayer_Section.AudioPlayer_ControlBar',
          [ h('.AudioPlayer_ControlBar_Group',
              [ knob('Speed',  String(Math.round(player.speed * 1000) / 1000) + 'x')
              , knob('Pitch',  String(player.pitch) + ' ct') ])
          , h('.AudioPlayer_ControlBar_Group',
              [ h('button.AudioPlayer_Info_Toggle', $.lib.icon('info-circle'))
              , h('button.AudioPlayer_Cues_Add', { onclick: addCue }, $.lib.icon('map-marker')) ])
          , h('.AudioPlayer_ControlBar_Group',
              [ knob('Volume', '0.00dB') ]) ]) }

      function cues () {
        return h('.AudioPlayer_Section.AudioPlayer_Cues',
          h('.AudioPlayer_Cues_List',
            cues.map(function (c, i) {
              return cue(i+1, c.label, c.time); }))) }

      function info () {
        return h('.AudioPlayer_Info',
          h('table.AudioPlayer_Info_Table',
            Object.keys(model.Metadata()[src] || {}).sort().map(tag))) }

      // utilities

      function getPlayer () {
        var player = model.Players.get(playerId);
        if (player && (player = player())) return player;
      }

      // actions

      function play () {
        var player = getPlayer()
        if (!player) return console.warn("can not play", playerId);
        player[player.status === 'playing' ? 'stop' : 'play']().then(update);
      }

      function stop () {
        var player = getPlayer()
        if (!player) return console.warn("can not stop", playerId);
        player.stop().then(function () { player.seek(0); update() });
      }

      function seek (event) {
        var player = getPlayer()
        if (!player) return console.warn("can not seek", playerId);
        var cls  = 'AudioPlayer_ProgressBar_Background'
          , bg   = event.currentTarget.getElementsByClassName(cls)[0]
          , rect = bg.getBoundingClientRect()
          , pos  = (event.clientX - rect.left) / rect.width;
        player.seek(pos * player.duration).then(update);
      }

      function update () {
        // trigger update via model
        model.Players.put(playerId, model.Players()[playerId]);
      }

      function cue (number, label, time) {
        return h('.AudioPlayer_Cue',
          [ h('.AudioPlayer_Cue_Label',
            [ h('.AudioPlayer_Cue_Number', { onclick: jump }, String(number))
            , label ])
        , h('.AudioPlayer_Cue_Time', $.lib.formatTime(time)) ])

        function jump () {
          player.seek(time);
          update();
        }
      }

      function addCue () {
        var cues   = model.Cues()[src]
          , newCue = { label: 'New Cue', time: player.position }
        if (cues) {
          model.Cues[src].push($.lib.model(newCue));
        } else {
          model.Cues.put(src, $.lib.model([ newCue ]))
        }
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
        , player   = this.player = $.plugins.sound.player(src)
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
