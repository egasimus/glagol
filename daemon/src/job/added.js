(function (node) {

  var path = require('path')
    , fs   = require('fs');

  var job = JSON.parse(node());

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
    $.log('spawning', command, 'for', job.id, 'as', id);
    $.util.mkdir(path.join(node.parent._sourcePath, id));
    fs.writeFileSync(path.join(node.parent._sourcePath, id, 'info'),
      JSON.stringify(
        { id: id
        , status: 'starting'
        , parent: job.id
        , command: command }))
  }

})
