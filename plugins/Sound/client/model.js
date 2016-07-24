module.exports = $.lib.model(

  { context:    new AudioContext()


  , Buffers:     {}

  , Metadata:    {}

  , Cues:        {}

  , Waveforms:   {}


  , Players:     {}

  , Sequencers:  {}

  , Mixers:      {}

  , Connections: {}

  });

module.exports.Connections(function (state) {
  _.reconnect(state);
})
