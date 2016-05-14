(function (src) {

  var ctx = App.Model.Sound.context();

  var voice = function voice (at, from, dur) {
    if (!voice.source) throw Error("can't play yet: no data loaded");
    try {
      voice.source.start(at, from, dur);
    } catch (e) {
      console.warn("can't start voice: already spent")
      return;
    }
    voice.startedAt   = ctx.currentTime;
    voice.startedFrom = from;
    if (voice.updateFps) voice.timer = setTimeout(update, 1000 / voice.updateFps);
    voice.source.onended = makeVoice;
  }

  voice.src         = src;
  voice.buffer      = null;
  voice.source      = null;
  voice.startedAt   = null;
  voice.startedFrom = null;
  voice.timer       = null;
  voice.onupdate    = undefined;
  voice.updateFps   = 30;
  voice.stop        = stop;

  _.buffer(src).then(function (buffer) {
    voice.buffer = buffer;
    makeVoice();
  })

  return voice;

  function makeVoice () {
    if (!voice.source) {
      voice.source = ctx.createBufferSource();
      voice.source.buffer = voice.buffer;
    }
    voice.source.connect(ctx.destination);
    voice.startedAt = null
    voice.timer = clearTimeout(voice.timer);
  }

  function stop () {
    var p = ctx.currentTime - voice.startedAt;
    try {
      voice.source.stop();
    } catch (e) {
      console.warn("can't stop voice: never been started")
    }
    voice.timer = clearTimeout(voice.timer);
    makeVoice();
    return p;
  }

  function update () {
    if (voice.onupdate)  voice.onupdate(voice);
    if (voice.updateFps) voice.timer = setTimeout(update, 1000 / voice.updateFps);
  }

})
