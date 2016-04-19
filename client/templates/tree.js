(function (root, socket) {

  var rows = [];
  if (root) addRow(0, root.name_, root);
  return rows;

  function addRow (depth, id, row) {
    rows.push(renderRow(depth, id + (row.nodes ? '/' : ''), row))
    if (row.nodes) {
      Object.keys(row.nodes).forEach(function (childId) {
        addRow(depth + 1, childId, row.nodes[childId]);
      })
    }
  }
        
  function renderRow (depth, name, data) {
    var file = !!data.source;

    return h('tr.Node',
      [ h('td.NodeName',
          { style: { paddingLeft: depth * 12 + 'px' } },
          h('.NodeNameName',
          [ name
          , !file ? h('.NodeCollapse', '▶')
                  : null ]))
      ].concat(
        file
        ? [ h('td.NodeSource',   _.editor(data)   )
          , h('td.NodeCompiled', button('compile'))
          , h('td.NodeValue',    button('run')    )
          , h('td.NodeFormat',   data.format      ) ]
        : [ h('td', h('hr'))
          , h('td')
          , h('td')
          , h('td') ]
      ).concat(
        [ h('td.NodeOptions') ])
      );

    function button (command) {
      return h('a.ButtonLink', { onclick: $.cmd(command, socket) }, command);
    }
  }

})
