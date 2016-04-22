(function renderRow (depth, path, name, data) {

  var visible  = App.model.visibleColumns()
    , expanded = App.model.displayOptions()['expanded view']
    , file = !!data.source
    , name = h('td.NodeName',
        { style: { paddingLeft: depth * 12 + 'px' } },
        h('.NodeNameName',
        [ name, !file ? h('.NodeCollapse', '▶') : null ]))
    , cols =
      [ col('source',   file ? _.glagolEditor(data) : '')
      , col('compiled', file ? [ button('compile'), data.compiled || '' ] : '')
      , col('value',    file ? [ button('run'),     data.value    || '' ] : '')
      , col('format',   file ? (data.format || '') : '') ];

  return h('tr.Node', { dataset: { path: path } }, [ name, cols ]);

  function button (command) {
    return h('a.ButtonLink', { onclick: $.cmd(command, path, socket) }, command);
  }

  function col (name, body) {
    if (!visible[name]) return;
    return h('td.Node' + name.charAt(0).toUpperCase() + name.slice(1), body)
  }

})
