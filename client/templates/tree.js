(function (root, socket) {

  var visible = App.model.visibleColumns();

  var rows = [];
  if (root) addRow(0, '/', root.name_, root);
  return rows;

  function addRow (depth, path, id, row) {
    if (row.nodes) id = id + '/';
    if (depth > 0) path = path + id;
    rows.push(renderRow(depth, path, id, row))
    if (row.nodes) {
      Object.keys(row.nodes).forEach(function (childId) {
        addRow(depth + 1, path, childId, row.nodes[childId]);
      })
    }
  }
        
  function renderRow (depth, path, name, data) {
    var file = !!data.source;

    return h('tr.Node',
      { dataset: { path: path } },
      [ h('td.NodeName',
          { style: { paddingLeft: depth * 12 + 'px' } },
          h('.NodeNameName',
          [ name
          , !file ? h('.NodeCollapse', '▶')
                  : null ]))
      ].concat(
        [ col('source',   file ? _.editor(data) : '')
        , col('compiled', file ? [ button('compile'), data.compiled || '' ] : '')
        , col('value',    file ? [ button('run'),     data.value    || '' ] : '')
        , col('format',   file ? (data.format || '') : '')
        ]
      ).concat(
        [ h('td.NodeOptions') ])
      );

    function button (command) {
      return h('a.ButtonLink', { onclick: $.cmd(command, path, socket) }, command);
    }
  }

  function col (name, body) {
    if (visible.indexOf(name) === -1) return null;
    return h('td.Node' + name.charAt(0).toUpperCase() + name.slice(1), body)
  }

})
