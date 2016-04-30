var exec = require('child_process').execFileSync;
module.exports = function getMimeType (location) {
  var cmd  = 'file'
    , args = [ '-b', '--mime-type', location ]
    , data = null;
  try {
    data = exec(cmd, args).toString().trim();
  } catch (e) {}
  console.log(location, data)
  return data;
}

