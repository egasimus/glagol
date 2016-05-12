(function (src) {

  var ctx = App.Model.Sound.context();

  var voice = function voice () {
    if (!voice.source) throw Error("can't play yet: no data loaded");
    voice.startedAt = ctx.currentTime;
    if (voice.updateFps) voice.timer = setInterval(update, 1000 / voice.updateFps);
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

  voice.request = new XMLHttpRequest();
  voice.request.open('GET', src, true);
  voice.request.responseType = 'arraybuffer';
  voice.request.onload = dataLoaded;
  voice.request.send();

  return voice;

  function dataLoaded () {
    ctx.decodeAudioData(voice.request.response).then(dataDecoded);
  }

  function dataDecoded (buffer) {
    voice.buffer = buffer;
    makeVoice();
  }

  function makeVoice () {
    if (!voice.source) {
      voice.source = ctx.createBufferSource();
      voice.source.buffer = voice.buffer;
    }
    voice.source.connect(ctx.destination);
    voice.startedAt = null
    voice.timer = clearInterval(voice.timer);
  }

  function stop () {
    if (voice.timer) {
      voice.source.stop();
      voice.timer = clearInterval(voice.timer);
    }
    makeVoice();
  }

  function update () {
    if (voice.update)    voice.update(voice);
    if (voice.updateFps) setTimeout(update, voice.updateFps);
  }

})
