(function (root) {

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
      [ h('td.NodeName', { style: { paddingLeft: depth * 12 + 'px' } },
          h('.NodeNameName',
          [ name
          , !file ? h('.NodeCollapse', file ? '' : '▶') : null ]))
      , h('td.NodeSource',   file ? _.editor(data) : '')
      , h('td.NodeCompiled', file ? h('a.ButtonLink', 'compile') : '')
      , h('td.NodeValue'   , file ? h('a.ButtonLink', 'run')     : '')
      , h('td.NodeFormat',   data.format)
      , h('td.NodeOptions') ]); }

})
