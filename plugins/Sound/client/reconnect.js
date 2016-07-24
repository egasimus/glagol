Glagol.events.once('changed', reload);

module.exports = function (state) {
  console.warn('reocnnect', state)
  Object.keys(state).forEach(function (input) {
    var connections = state[input];
    input = input.split('/')
    var mixer = _.model.Mixers()[input[0]];
    if (!mixer) return console.error('no mixer', input[0]);
    var channel = mixer.channels[input[1]];
    Object.keys(connections).forEach(function (output) {
      var player = _.model.Players[output];
      if (!player) return;
      player = player();
      console.log('connecting output of', player, 'into', input);
      player.output.connect(channel.meter);
    });
  })
}

function reload () {
  _.reconnect(_.model().Connections);
}
