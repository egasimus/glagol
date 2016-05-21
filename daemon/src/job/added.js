(function (node) {

  var path = require('path')
    , bold = $.util.colors.bold
    , blue = $.util.colors.blue;

  var job = $.cache.jobs[node.path] = JSON.parse(node());

  if (!job.status) {
    if (!job.task) {
      $.log("can't spawn", job.id, ": no job data")
    } else {
      (job.task.commands || []).forEach(addProcess.bind(null, job));
      job.status = 'starting';
      $.util.write(node._sourcePath, job);
    }
    return;
  }

  function addProcess (job, command) {
    var id = path.basename(command) + '.' + $.util.id();
    $.log('adding process', blue(command), 'for', blue(job.id), 'as', blue(id));
    $.util.mkdir(path.join(node.parent._sourcePath, id));
    $.util.write(path.join(node.parent._sourcePath, id, 'info'),
      { id:      id
      , parent:  job.id
      , command: command })
  }

})
