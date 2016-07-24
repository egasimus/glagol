var vdom = require('virtual-dom');

module.exports = function (frame, index) {

  var mixer = App.Model.Sound.Mixers()[frame.id]

  if (mixer) return require('vdom-thunk')(module.exports.widget, mixer);

  setTimeout(function () {
    App.Model.Sound.Mixers.put(frame.id, makeMixer(frame.id))
  }, 0);
  return 'loading...'
}

function makeMixer (id) {

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
        , midHigh: context.createBiquadFilter()
        , midLow:  context.createBiquadFilter()
        , low:     context.createBiquadFilter()
        , fader:   context.createGain() };

    ['gain', 'pan', 'high', 'midHigh', 'midLow', 'low', 'fader'].reduce(
      function (previous, current) {
        if (previous) channel[previous].connect(channel[current]);
      })

    return channel;

  }

}

module.exports.widget = function (mixer) {

  var id = mixer.id
    , model = App.Model.Sound;

  return {

    type: "Widget"

  , init: function () {
      this.element = vdom.create(this.render(model()));
      model(this.patch.bind(this));
      return this.element;
    }

  , update: function (prev, el) {
      this.element  = this.element  || prev.element;
      this.timer    = this.timer    || prev.timer;
    }

  , destroy: function (el) {
      var mixer = model.Mixers()[id];
      if (this.timer) clearInterval(this.timer);
    }

  , patch: function (state) {
      this.element = vdom.patch(this.element,
        vdom.diff(this._vdom, this.render(state)));
    }

  , render: function (state) {

      return this._vdom = h('.Mixer',
        [ h('.Frame_Header.Mixer_Toolbar',
            [ $.lib.icon('sliders.fa-2x')
            , h('select.Mixer_Selector', [ h('option', mixer.id) ])
            , h('.Frame_Close', { onclick: close }, '×') ])
        , h('.Mixer_Channels',
          [ h('.Mixer_Sidebar',
              [ mixer.channels.map(sidebarChannel)
              , h('.Mixer_Sidebar_Channel_Add', '+ add channel') ])
          , mixer.channels.map(channelStrip)
          , h('.Mixer_ChannelStrip_Master',
              h('.Mixer_Knob_Group_WithFader',
                h('.Mixer_FaderAndMeter',
                [ h('.Mixer_Fader')
                , h('.Mixer_Meter')]))) ]) ]);

      if (!mixer) {
        return this._vdom = h('.Mixer_Missing',
          [ 'No mixer'
          , h('em', id)
          ]);
      }

      return this._vdom = h('.Mixer');

      function close () {
        App.API('Workspace/Close', id);
      }

      function sidebarChannel (ch, i) {
        return h('.Mixer_Sidebar_Channel', [ i, ' ', h('strong', ch.id) ])
      }

      function channelStrip (channel) {
        return h('.Mixer_ChannelStrip',
          [ h('.Mixer_Knob_Group',
              h('select', { onchange: setInput(channel) },
                [null].concat(Object.keys(state.Players)).map(inputOption(channel))))
          , h('.Mixer_Knob_Group', knob('gain'))
          , h('.Mixer_Knob_Group', knob('hi'))
          , h('.Mixer_Knob_Group',
            [ knob('hi mid')
            , knob('freq') ])
          , h('.Mixer_Knob_Group',
            [ knob('lo mid')
            , knob('freq') ])
          , h('.Mixer_Knob_Group', knob('lo'))
          , h('.Mixer_Knob_Group',
            [ knob('aux1')
            , knob('aux2') ])
          , h('.Mixer_Knob_Group_WithFader',
            [ knob('pan')
            , h('.Mixer_FaderAndMeter',
              [ h('.Mixer_Fader')
              , h('.Mixer_Meter')]) ])
          ]);
      }

      function inputOption (channel) {
        return function (input) {
          var channelId   = id + '/' + channel
            , connections = state.Connections[channelId] || {};
          var selected = !!connections[input];
          return h('option', { value: input, selected: selected }, input || '(none)');
        }
      }

      function knob (label) {
        return h('.Mixer_Knob_Label',
          [ h('.Mixer_Knob_Label_Text', label)
          , h('.Mixer_Knob') ])
      }

      function setInput (channel) {
        return function (event) {
          var input = __.model.Connections[channel.id]
          if (!input) __.model.Connections.put(channel.id, input = $.lib.model({}))
          input.put(event.target.value, true)
        }
      }

    }

  }

}
