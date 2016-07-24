Glagol.events.once('changed', reload);

module.exports = function (state) {
  console.warn('reocnnect', state)
  Object.keys(state).forEach(function (input) {
    var connections = state[input];
    input = input.split('/')
    var mixer = _.model.Mixers()[input[0]];
    if (!mixer) return console.error('no mixer', input[0]);
    var channel = mixer.channels[input[1]];
    console.log('here it is', state, input, state[input])
    Object.keys(connections).forEach(function (output) {
      console.log('connecting output of', _.model.Players[output], 'into', input);
      //.connect(channel.gain);
    });
  })
}

function reload () {
  _.reconnect(_.model().Connections);
}
