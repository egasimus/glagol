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
      var sequencer = model.Sequencers()[id];
      if (sequencer) sequencer.stop();
      if (this.timer) clearInterval(this.timer);
    }

  , patch: function (state) {
      this.element = vdom.patch(this.element,
        vdom.diff(this._vdom, this.render(state)));
    }

  , render: function (state) {

      var self      = this
        , sequencer = state.Sequencers ? state.Sequencers[id] : null;

      return this._vdom = h('.Sequencer',
        [ h('.Frame_Header',
          [ h('button.Sequencer_Button_Play', '⏯')
          , h('button.Sequencer_Button_Stop', $.lib.icon('stop'))
          , h('button.Sequencer_Position', '00:00:00')
          , h('.Sequencer_Title', 'Sequence 1')
          , h('.Frame_Close', { onclick: close }, '×') ])
        , h('.Sequencer_Section',
          [ /*h('.Sequencer_Patterns',
            [ h('.Sequencer_Pattern', 'Pattern 1')
            , h('.Sequencer_Pattern', 'Pattern 2')
            , h('.Sequencer_Pattern', 'Pattern 3')
            , h('.Sequencer_Pattern', 'Pattern 4')
            , h('.Sequencer_Pattern', 'Pattern 5')
            , h('.Sequencer_Pattern', 'Pattern 6')
            , h('.Sequencer_Pattern', 'Pattern 7')
            , h('.Sequencer_Pattern', 'Pattern 8') ])*/
          , h('.Sequencer_Sequence',
              [1,2,3,4,5,6,7,8].map(track)) ])
        ]);

      if (!sequencer) {
        return this._vdom = h('.Sequencer_Missing',
          [ 'No sequencer'
          , h('em', id)
          ]);
      }

      return this._vdom = h('.Sequencer');

      function close () {
        App.API('Workspace/Close', id);
      }

      function track () {
        var grid = [ h('.Sequencer_Track_Label', 'track') ]
          , n    = 16
        for (var i = 0; i < n; i++) grid.push(
          h('.Sequencer_Grid', { style: { width: (100/n) + '%' } }))
        return h('.Sequencer_Track', grid);
      }

    }

  }
}
