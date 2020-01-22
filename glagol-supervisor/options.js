module.exports =
  { tasks:
      require('path').resolve(__dirname, 'tasks')
  , pids:
      '/run/user/' + process.getuid() + '/glagol/pids'
  , logs:
      '/run/user/' + process.getuid() + '/glagol/logs' }
