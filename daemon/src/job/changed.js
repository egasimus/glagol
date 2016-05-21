(function (node) {

  if (node._glagol.type !== 'File') return;

  var data = JSON.parse(node());
  console.log('changed', node._sourcePath);
  console.log(data);

  if (data.state === 'spawning') {
    // TODO: kill preexisting processes
    data.state = 'alive';
    fs.writeFileSync(node._sourcePath, JSON.stringify(data), 'utf8');
    return;
  }

})
