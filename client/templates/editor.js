require('virtual-widget')(
  { init: function (state) {
      this.state = state;
      this.el = document.createElement('div');
      this.el.className = 'SourceEditor';
      this.el.appendChild(document.createElement('textarea'))
      this.el.firstChild.value = state.source;
      document.body.appendChild(this.el);
      this.mirror = require('codemirror').fromTextArea(
        this.el.firstChild,
        { viewportMargin: Infinity });
      document.body.removeChild(this.el);
      return this.el;
    }
  , update: function (prev, el) {
      this.mirror = this.mirror || prev.mirror;
    }
  , destroy: function (el) {
    } })

//(function (data) {

  //if (data.source)
    //return h('.SourceEditor',
      //[ h('.SourceEditorOutput',        data.source)
      ////, h('textarea.SourceEditorInput', data.source)
      //]);

//})
