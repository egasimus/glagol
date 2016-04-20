(function (root, socket) {

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
        file
        ? [ h('td.NodeSource',   _.editor(data)   )
          , h('td.NodeCompiled', data.compiled ? data.compiled : button('compile'))
          , h('td.NodeValue',    data.value    ? data.value    : button('run')    )
          , h('td.NodeFormat',   data.format      ) ]
        : [ h('td', h('hr'))
          , h('td')
          , h('td')
          , h('td') ]
      ).concat(
        [ h('td.NodeOptions') ])
      );

    function button (command) {
      return h('a.ButtonLink', { onclick: $.cmd(command, path, socket) }, command);
    }
  }

})
