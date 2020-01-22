(function (path, data) {
  require('fs').writeFileSync(path, JSON.stringify(data), 'utf8');
})
