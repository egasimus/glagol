var vdom = require('virtual-dom');

module.exports = function (frame, index) {

  var mixer = App.Model.Sound.Mixers()[frame.id]

  if (mixer) return require('vdom-thunk')(module.exports.widget, mixer);

  setTimeout(function () {
    App.Model.Sound.Mixers.put(frame.id, __.devices.mixer(frame.id))
  }, 0);
  return 'loading...'
}

module.exports.widget = function (mixer) {

  var id = mixer.id
    , model = App.Model.Sound;

  return {

    type: "Widget"

  , init: function () {
      this.element = vdom.create(this.render(model()));
      model(this.patch.bind(this));
      this.animation = requestAnimationFrame(this.animate(this))
      return this.element;
    }

  , update: function (prev, el) {
      this.element   = this.element   || prev.element;
      this.animation = this.animation || prev.animation;
      cancelAnimationFrame(this.animation);
      this.animation = requiestAnimationFrame(this.animate(this));
    }

  , destroy: function (el) {
      var mixer = model.Mixers()[id];
      if (this.animation) cancelAnimationFrame(this.animation);
    }

  , patch: function (state) {
      this.element = vdom.patch(this.element,
        vdom.diff(this._vdom, this.render(state)));
    }

  , animate: function animate (self) {
      return function (t) {

        mixer.channels.forEach(function (channel) {
          var volume = Math.max(channel.meter.volume, 0.00001)
          if (channel.lastVolume !== volume) {
            //console.log(channel.lastVolume = volume);
            var channelNo     = channel.id.split('/')[1]
              , channelStrips = self.element.getElementsByClassName('Mixer_ChannelStrip')
              , channelStrip  = channelStrips[channelNo]
              , channelBar    = channelStrip.querySelector('.Mixer_Meter_Inner')
            channelBar.style.transform = 'translateY(' + (100 - volume * 100) + '%)';
          }
        })

        var volume = Math.max(mixer.meter.volume, 0.00001);
        if (mixer.master.lastVolume !== volume) {
          var masterStrip = self.element.getElementsByClassName('Mixer_ChannelStrip_Master')[0]
            , masterBar   = masterStrip.querySelector('.Mixer_Meter_Inner');
          masterBar.style.transform = 'translateY(' + (100 - volume * 100) + '%)';
        }

        self.animation = requestAnimationFrame(animate(self));

      }
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
                , h('.Mixer_Meter', h('.Mixer_Meter_Inner')) ]))) ]) ]);

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
          , h('.Mixer_Knob_Group',
              knob('gain',   channel.gain.gain.value))
          , h('.Mixer_Knob_Group',
              knob('hi',     channel.high.gain.value))
          , h('.Mixer_Knob_Group',
            [ knob('hi mid', channel.highMid.gain.value)
            , knob('freq',   channel.highMid.frequency.value) ])
          , h('.Mixer_Knob_Group',
            [ knob('lo mid', channel.lowMid.gain.value)
            , knob('freq',   channel.lowMid.frequency.value) ])
          , h('.Mixer_Knob_Group',
              knob('lo',     channel.low.gain.value))
          , h('.Mixer_Knob_Group',
            [ knob('aux1')
            , knob('aux2') ])
          , h('.Mixer_Knob_Group_WithFader',
            [ knob('pan')
            , h('.Mixer_FaderAndMeter',
              [ h('.Mixer_Fader')
              , h('.Mixer_Meter', h('.Mixer_Meter_Inner'))]) ])
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

      function knob (label, value) {
        return h('.Mixer_Knob_Label',
          [ h('.Mixer_Knob_Label_Text',
            [ h('div', label || '')
            , h('div', String(value || '0')) ])
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
