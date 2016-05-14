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
    update();
  }

  function stop () {
    try {
      player.cuePoint = player.voices.shift().stop();
    } catch (e) {
      console.warn("can't stop:", e);
    }
    init();
  }

  function seek (t) {
    stop();
    player.cuePoint = t;
    play();
  }

  function update (voice) {
    //var pos = ctx.currentTime - voice.startedAt + voice.startedFrom
      //, dur = voice.buffer.duration;
    //if (player.onupdate) player.onupdate(pos, dur);
  }

})
