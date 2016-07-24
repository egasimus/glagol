module.exports = function (id) {

  var context = __.model().context
    , mixer =
      { id:       id
      , context:  context
      , master:   context.createGain()
      , meter:    _.meter(context) }

  mixer.channels = [0,1,2,3].map(mixerChannel)
  mixer.channels.forEach(function (channel) { channel.fader.connect(mixer.master); })
  mixer.master.connect(context.destination);
  mixer.master.connect(mixer.meter);

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

    channel.gain.connect(channel.low);
    channel.low.type.value          = 'lowshelf';
    channel.low.frequency.value     = 150;
    channel.low.connect(channel.lowMid)
    channel.lowMid.type.value       = 'peaking';
    channel.lowMid.frequency.value  = 1000;
    channel.lowMid.connect(channel.highMid)
    channel.highMid.type.value      = 'peaking';
    channel.highMid.frequency.value = 3000;
    channel.highMid.connect(channel.high)
    channel.high.type.value         = 'highshelf';
    channel.high.frequency.value    = 10000
    channel.high.connect(channel.fader);
    channel.fader.connect(channel.meter);
    channel.fader.connect(mixer.master);

    return channel;

  }

}
