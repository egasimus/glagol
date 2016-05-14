(function (src) {

  var ctx = App.Model.Sound.context();

  var voice = function voice () {
    if (!voice.source) throw Error("can't play yet: no data loaded");
    voice.startedAt = ctx.currentTime;
    if (voice.updateFps) voice.timer = setTimeout(update, 1000 / voice.updateFps);
    voice.source.start(0, 0);
    voice.source.onended = makeVoice;
  }

  voice.src       = src;
  voice.buffer    = null
  voice.source    = null
  voice.startedAt = null
  voice.timer     = null;
  voice.update    = undefined;
  voice.updateFps = 30;
  voice.stop      = stop;

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
    voice.source.stop();
    voice.timer = clearTimeout(voice.timer);
    makeVoice();
  }

  function update () {
    if (voice.update)    voice.update(voice);
    if (voice.updateFps) voice.timer = setTimeout(update, voice.updateFps);
  }

})
