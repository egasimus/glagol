(function (node) {

  var path = require('path')
    , fs   = require('fs')
    , bold = $.util.colors.bold
    , blue = $.util.colors.blue;

  var job = $.cache.jobs[node.path] = JSON.parse(node());

  if (!job.state) {
    if (!job.task) {
      $.log("can't spawn", job.id, ": no job data")
    } else {
      (job.task.commands || []).forEach(spawnCommand.bind(null, job));
      job.state = 'starting';
      fs.writeFileSync(node._sourcePath, JSON.stringify(job), 'utf8');
    }
    return;
  }

  function spawnCommand (job, command) {
    var id = path.basename(command) + '.' + $.util.id();
    $.log('spawning', blue(command), 'for', blue(job.id), 'as', blue(id));
    $.util.mkdir(path.join(node.parent._sourcePath, id));
    fs.writeFileSync(path.join(node.parent._sourcePath, id, 'info'),
      JSON.stringify(
        { id: id
        , status: 'starting'
        , parent: job.id
        , command: command }))
  }

})
