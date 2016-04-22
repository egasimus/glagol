(function renderRow (depth, path, name, data) {

  var visible  = App.model.visibleColumns()
    , expanded = App.model.displayOptions()['expanded view']
    , file     = !!data.source
    , name
    , cols;

  if (expanded) {

    cols =
      [ h('td.Node_Name',
          { style: { paddingLeft: depth * 12 + 'px' } },
          h('.Node_Name_Name',
          [ name, !file ? h('.Node_Collapse', '▶') : null ]))
      , col('source',   ifFile(_.glagolEditor(data)))
      , col('compiled', ifFile([ button('compile'), data.compiled || '' ]))
      , col('value',    ifFile([ button('run'),     data.value    || '' ]))
      , col('format',   ifFile((data.format || ''))) ];

  } else {

    cols =
      [ h('td.Node_NameSource', { style: { paddingLeft: depth * 12 + 'px' } },
          [ h('.Node_NameSource_Name', name)
          , visible.source
            ? ifFile(_.glagolEditor(data))
            : '' ])
      , h('td.Node_FormatCompiled',
          [ visible.format
            ? ifFile(h('.Node_FormatCompiled_Format', data.format || '<format>'))
            : ''
          , visible.compiled
            ? ifFile(data.compiled)
            : '' ])
      , h('td.Node_Value') ]

  }

  return h('tr.Node', { dataset: { path: path } }, cols);

  function ifFile (data) {
    return file ? data : ''
  }

  function button (command) {
    return h('a.ButtonLink', { onclick: $.cmd(command, path, socket) }, command);
  }

  function col (name, body) {
    if (!visible[name]) return;
    return h('td.Node_' + name.charAt(0).toUpperCase() + name.slice(1), body)
  }

})
