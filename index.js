var fuse = require('fusejs');

EtudeFS = function () {};
EtudeFS.prototype = Object.create(fuse.FileSystem.prototype);

fuse.fuse.mount({ filesystem: EtudeFS, options: ["EtudeFS", "/tmp/etudefs"] })
