var extend = require('extend');

module.exports = function (mixerId) {

  var context = __.model().context;

  var mixer =
    { id:      mixerId
    , context: context
    , master:  context.createGain()
    , meter:   _.meter(context) };

  mixer.channels = [0,1,2,3].map(mixerChannel)
  mixer.master.connect(context.destination);
  mixer.master.connect(mixer.meter);
  return mixer;

  function mixerChannel (i) {
    var channel =
      { id:      mixerId + '/' + i
      , gain:    context.createGain()
      , low:     filter('lowshelf',  150)
      , lowMid:  filter('peaking',   1000)
      , highMid: filter('peaking',   4000)
      , high:    filter('highshelf', 10000)
      , pan:     context.createStereoPanner()
      , fader:   context.createGain()
      , meter:   _.meter(context) };
    channel.gain.connect(channel.low);
    channel.low.connect(channel.lowMid)
    channel.lowMid.connect(channel.highMid)
    channel.highMid.connect(channel.high)
    channel.high.connect(channel.fader);
    channel.fader.connect(channel.meter);
    channel.fader.connect(mixer.master);
    return channel;
  }

  function filter (type, freq) {
    var filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    return filter;
  }

}
