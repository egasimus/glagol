(function (src) {

  var voice1    = $.modules.sound.voice(src)
    , voice2    = $.modules.sound.voice(src)
    , startFrom = 0;

  return {
    play:  play,
    pause: pause,
    cue:   cue
  }

  function play () {
    voice1(0, startFrom)
  }

  function pause () {
    startFrom = voice1.stop();
    voice1 = voice2;
    voice2 = $.modules.sound.voice(src)
  }

  function cue (t) {
    startFrom = t;
  }

  function update (voice) {
    var ctx = App.Model.Sound.context()
      , pos = ctx.currentTime - voice.startedAt + startFrom
      , dur = voice.buffer.duration;
    if (player.onupdate) player.onupdate(pos, dur);
  }

})
