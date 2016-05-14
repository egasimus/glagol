(function (src) {

  var ctx = App.Model.Sound.context();

  var player = {};

  player.voices = [];
  init();

  player.status = 'loading';

  player.position = null;
  player.duration = null;
  player.cuePoint = 0;

  player.play = play;
  player.stop = stop;
  player.seek = seek;

  player.startedAt   = null;
  player.startedFrom = null;
  player.updateTimer = null;
  player.updateFPS   = 30;

  return player;

  function init () {
    _.buffer(src).then(function (buffer) {
      var voice = ctx.createBufferSource();
      voice.buffer = buffer;
      voice.connect(ctx.destination);
      player.voices.push(voice);
      player.duration = buffer.duration;
      player.status = 'stopped';
      update();
    });
  }

  function play () {
    player.voices[0].start(0, player.cuePoint);
    player.status = 'playing';
    player.startedAt = ctx.currentTime;
    update();
  }

  function stop () {
    try {
      player.cuePoint = player.voices.shift().stop();
    } catch (e) {
      console.warn("can't stop:", e);
    }
    player.updateTimer = clearTimeout(player.updateTimer);
    init();
  }

  function seek (t) {
    stop();
    player.cuePoint = t;
    play();
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
