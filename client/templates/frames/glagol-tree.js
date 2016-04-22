(function (root, socket) {

  var rows = [];
  if (root) addRow(0, '/', root.name_, root);
  return rows;

  function addRow (depth, path, id, row) {
    if (row.nodes) id = id + '/';
    if (depth > 0) path = path + id;
    rows.push(_.glagolRow(depth, path, id, row))
    if (row.nodes) {
      Object.keys(row.nodes).forEach(function (childId) {
        addRow(depth + 1, path, childId, row.nodes[childId]);
      })
    }
  }
        
})

