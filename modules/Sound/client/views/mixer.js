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

      var self      = this
        , mixer = state.Mixers ? state.Mixers[id] : null;

      return this._vdom = h('.Mixer',
        [ h('.Mixer_Toolbar', 'Mix 1')
        , h('.Mixer_Channels', [1,2,3,4,5,6,7,8].map(channel)) ]);

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

      function channel () {
        return h('.Mixer_Channel',
          [ h('.Mixer_Knob',  'gain')
          , h('.Mixer_Knob',  'hi')
          , h('.Mixer_Knob',  'hi mid')
          , h('.Mixer_Knob',  'hi mid freq')
          , h('.Mixer_Knob',  'lo mid')
          , h('.Mixer_Knob',  'lo mid freq')
          , h('.Mixer_Knob',  'lo')
          , h('.Mixer_Knob',  'pan')
          , h('.Mixer_Knob',  'aux')
          , h('.Mixer_Fader', 'fader')
          ]
          );
      }

    }

  }
}
