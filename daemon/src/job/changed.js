(function (node) {

  var bold = $.util.colors.bold
    , blue = $.util.colors.blue;

  // TODO: fix diff
  var cached = $.cache.jobs[node.path] || {}
    , job    = JSON.parse(node())
    , diff   = require('deep-diff')(cached, job);
  $.cache.jobs[node.path] = job;

  var data = JSON.parse(node());
  $.log('changed', bold('job info'), blue(node.path));

  if (data.state === 'spawning') {
    // TODO: kill preexisting processes
    data.state = 'alive';
    fs.writeFileSync(node._sourcePath, JSON.stringify(data), 'utf8');
    return;
  }

})
