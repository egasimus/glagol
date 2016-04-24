(function renderRow (depth, path, name, data, socket) {

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
      , col('format',   ifFile((data.format || '')))
      , col('options',  '')
      ];

  } else {

    if (file) {
      cols =
        [ h('td.Node_NameSource', { style: { paddingLeft: depth * 12 + 'px' } },
            [ h('.Node_Toolbar',
              [ h('.Node_NameSource_Name', h('strong', name))
              , visible.format ?
                  button('format', data.format
                    ? data.format.name_
                    : h('em', 'unknown')) : '' ])
            , visible.source ? _.glagolEditor(data) : '' ])
        , h('td.Node_FormatCompiled',
            [ h('.Node_Toolbar',
              [ button('compile')
              , button('evaluate') ] )
            , visible.compiled ? data.compiled : '' ])
        , h('td.Node_Value-notExpanded',
            visible.value
            ? [ h('.Node_Toolbar', [])
              , getValue(data) || '' ]
            : '')
        ]
    } else {
      cols =
        [ h('td.Node_NameSource', { style: { paddingLeft: depth * 12 + 'px' } },
            [ h('.Node_Toolbar',
              [ h('.Node_NameSource_Name',
                [ h('strong', name.slice(0, -1)), '/' ])
              , visible.format
                  ? h('.Node_Toolbar_Button',
                      data.format
                      ? data.format.name_
                      : h('em', 'Directory'))
                  : ''
              ])
            ])
        , h('td.Node_FormatCompiled',
            [ h('.Node_FileCount',
                String(Object.keys(data.nodes).length) + ' nodes') ])
        , h('td.Node_Value-notExpanded') ]
    }

  }

  function button (name, text) {
    var onclick =
      name === 'compile'  ? $.cmd('compile',  path, socket) :
      name === 'evaluate' ? $.cmd('evaluate', path, socket) :
      null;
    return h('.Node_Toolbar_Button', { onclick: onclick }, String(text || name));
  }

  return h('tr.Node', { dataset: { path: path } }, cols);

  function when(key, el) {
    return key ? el : '';
  }

  function ifFile (data) {
    return when(file, data);
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
        [ h('strong', h('em', 'Fn  '))
        , value.name_
        , ' (' + value.args + ')' ])
    } else {
      return value.value;
    }
  }

})
