(function (src) {

  var ctx = App.Model.Sound.context();

  var player =
    { status: 'loading'
    , position: null
    , duration: null
    , cuePoint: 0

    , startedAt:   null
    , startedFrom: null

    , updateTimer: null
    , updateFPS:   30

    , voices: [ newVoice().then(init) ]

    , play: play
    , stop: stop
    , seek: seek

    , constructor: true }; // fool is-plain-object

  console.trace(player.voices)

  return player;

  function newVoice () {
    return _.buffer(src).then(function (buffer) {
      var v = ctx.createBufferSource();
      v.buffer = buffer;
      v.connect(ctx.destination);
      return v;
    })
  }

  function init (voice) {
    player.duration = voice.buffer.duration;
    player.status = 'stopped';
    update();
    return voice;
  }

  function play () {
    console.trace(player.voices)
    return player.voices[0].then(function (voice) {
      voice.start(0, player.cuePoint);
      player.status      = 'playing';
      player.startedAt   = ctx.currentTime;
      player.startedFrom = player.cuePoint;
      update();
      return voice;
    });
  }

  function stop () {
    return player.voices.shift().then(function (voice) {
      try { voice.stop() } catch (e) {}
      player.voices.push(newVoice());
      player.status      = 'stopped';
      player.cuePoint    = player.position;
      player.updateTimer = clearTimeout(player.updateTimer);
      update();
      return voice;
    })
  }

  function seek (t) {
    if (player.status === 'playing') {
      stop().then(function () { player.cuePoint = t }).then(play);
    } else {
      player.cuePoint = t;
    }
  }

  function update () {
    if (player.startedAt) {
      var elapsed = ctx.currentTime - player.startedAt;
      player.position = player.startedFrom + elapsed;
    }
    if (player.status === 'playing') {
      player.updateTimer = setTimeout(update, 1000 / player.updateFPS);
    }
    if (player.onupdate) player.onupdate(player);
  }

})
