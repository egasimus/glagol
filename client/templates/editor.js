(function (data) {

  if (data.source)
    return h('.SourceEditor',
      [ h('.SourceEditorOutput',        data.source)
      , h('textarea.SourceEditorInput', data.source) ]);

})
