module.exports = function (id) {

  var context = __.model().context
    , mixer =
      { id:       id
      , context:  context
      , channels: [1,2,3,4].map(mixerChannel)
      , master:   context.createGain() }

  mixer.channels.forEach(function (channel) {
    channel.fader.connect(mixer.master);
  })

  return mixer;

  function mixerChannel (i) {

    var channelId = id + '/' + i
      , channel =
        { id:      channelId
        , gain:    context.createGain()
        , pan:     context.createStereoPanner()
        , high:    context.createBiquadFilter()
        , highMid: context.createBiquadFilter()
        , lowMid:  context.createBiquadFilter()
        , low:     context.createBiquadFilter()
        , fader:   context.createGain()
        , meter:   _.meter(context) };

    channel.high.type.value         = 'highshelf';
    channel.high.frequency.value    = 10000
    channel.highMid.type.value      = 'peaking';
    channel.highMid.frequency.value = 3000;
    channel.lowMid.type.value       = 'peaking';
    channel.lowMid.frequency.value  = 1000;
    channel.low.type.value          = 'lowshelf';
    channel.low.frequency.value     = 150;

    ['gain', 'pan', 'high', 'highMid', 'lowMid', 'low', 'fader', 'meter'].reduce(
      function (previous, current) {
        if (previous) channel[previous].connect(channel[current]);
      })

    return channel;

  }

}

