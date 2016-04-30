var exec = require('child_process').execFileSync;
module.exports = function getMimeType (location) {
  console.log("getMimeType", location)
  var cmd  = 'file'
    , args = [ '-b', '--mime-type', location ];
  console.log(cmd, args)
  var data = exec(cmd, args).toString().trim();
  console.log(data)
  return exec('file', ['-b', '--mime-type', location]).toString().trim();
}

