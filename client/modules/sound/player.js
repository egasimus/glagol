(function (src) {

  var player = {};

  player.voices = [ $.modules.sound.voice(src) ];
  player.position = null;
  player.duration = null;
  player.cuePoint = 0;
  player.play = play;
  player.stop = stop;
  player.seek = seek;

  return player;

  function play () {
    var voice = player.voices[0];
    player.voices[0].onupdate = update;
    player.voices[0](0, player.cuePoint);
  }

  function stop () {
    var voice = player.voices.shift();
    player.cuePoint = voice.stop();
    player.voices.push($.modules.sound.voice(src));
  }

  function seek (t) {
    pause();
    player.cuePoint = t;
    play();
  }

  function update (voice) {
    var ctx = voice.source.context
      , pos = ctx.currentTime - voice.startedAt + voice.startedFrom
      , dur = voice.buffer.duration;
    if (player.onupdate) player.onupdate(pos, dur);
  }

})
