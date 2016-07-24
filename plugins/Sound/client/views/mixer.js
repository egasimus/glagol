var vdom = require('virtual-dom');

module.exports = function (state) {
  return require('vdom-thunk')(module.exports.widget, state.id);
}

module.exports.widget = function (id) {

  var model = App.Model.Sound;

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
      if (mixer) mixer.stop();
      if (this.timer) clearInterval(this.timer);
    }

  , patch: function (state) {
      this.element = vdom.patch(this.element,
        vdom.diff(this._vdom, this.render(state)));
    }

  , render: function (state) {

      var mixer     = state.Mixers ? state.Mixers[id] : null
        , channels  = [1,2,3,4]

      return this._vdom = h('.Mixer',
        [ h('.Frame_Header.Mixer_Toolbar',
            [ $.lib.icon('sliders.fa-2x')
            , h('select.Mixer_Selector', [ h('option', 'Mix 1') ])
            , h('.Frame_Close', { onclick: close }, '×') ])
        , h('.Mixer_Channels',
          [ h('.Mixer_Sidebar',
              [ channels.map(sidebarChannel)
              , h('.Mixer_Sidebar_Channel_Add', '+ add channel') ])
          , channels.map(channelStrip)
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

      function sidebarChannel (i) {
        return h('.Mixer_Sidebar_Channel', 'Channel ' + i)
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
          var channelId = id + '/' + channel;
          var input = __.model.Connections[channelId]
          if (!input) __.model.Connections.put(channelId, input = $.lib.model({}))
          input.put(event.target.value, true)
        }
      }

    }

  }

}
