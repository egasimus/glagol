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
      , col('compiled', ifFile([ button('compile'), data.compiled  || '' ]))
      , col('value',    ifFile([ button('run'),     getValue(data) || '' ]))
      , col('format',   ifFile((data.format || ''))) ];

  } else {

    cols =
      [ h('td.Node_NameSource', { style: { paddingLeft: depth * 12 + 'px' } },
          [ h('.Node_Toolbar',
            [ h('.Node_NameSource_Name',
              file
                ? h('strong', name)
                : [ h('strong', name.slice(0, -1)), '/' ])
            , visible.format
                ? h('.Node_Toolbar_Button',
                    data.format
                    ? data.format.name_
                    : file
                      ? h('em', 'no format')
                      : h('em', 'Directory'))
                : ''
            ])
          , visible.source
            ? ifFile(_.glagolEditor(data))
            : '' ])
      , h('td.Node_FormatCompiled',
          ifFile(
          [ h('.Node_Toolbar',
            [ h('.Node_Toolbar_Button', 'compile')
            , h('.Node_Toolbar_Button', 'evaluate') ] )
          , visible.compiled ? data.compiled : '' ]))
      , h('td.Node_Value-notExpanded',
          visible.value ? ifFile([ h('.Node_Toolbar', [])
          , getValue(data) || '' ]) : '') ]

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

  function getValue (data) {
    var value = data.value;
    if (!value) return;
    if (value.type === 'function') {
      return h('.Node_Value_Function',
        [ h('em', 'F ')
        , value.name_
        , ' (' + value.args + ')' ])
    } else {
      return value.value;
    }
  }

})
