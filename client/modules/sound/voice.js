(function (src) {

  var ctx = App.Model.Sound.context();

  var buffer    = null
    , source    = null
    , startedAt = null
    , timer     = null;

  var request = new XMLHTTPRequest();
  request.open('GET', src, true);
  request.responseType = 'arraybuffer';
  request.onload = dataLoaded(request);
  request.send();

  return play;

  function dataLoaded () {
    ctx.decodeAudioData(request.response).then(dataDecoded);
  }

  function dataDecoded (audioBuffer) {
    data = audioBuffer;
    makeVoice();
  }

  function makeVoice () {
    if (!source) {
      source = ctx.createBufferSource();
      source.buffer = buffer;
    }
    source.connect(ctx.destination);
    startedAt = null
    timer = clearInterval(timer);
  }

  function play () {
    if (!source) {
      console.warn("can't play voice: data not loaded");
      return;
    }
    startedAt = ctx.currentTime;
    timer = setInterval(update, 20);
    source.start(0, 0);
    source.onended = makeVoice;
  }

  function pause () {
    if (timer) {
      source.stop();
      timer = clearInterval(timer);
    }
    makeVoice();
  }

})
