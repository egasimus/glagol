var fuse = require('fusejs');

EtudeFS = function () {};
EtudeFS.prototype = Object.create(fuse.FileSystem.prototype);

module.exports = function (mountPath) {
  return fuse.fuse.mount({ filesystem: EtudeFS, options: ["EtudeFS", mountPath] });
}
