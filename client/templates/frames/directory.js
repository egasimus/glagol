(function (frame, index) {

  var directory = App.model.directories()[frame.address];

  return h('.Directory', (directory || []).map(entry))

  function entry (data) {
    var isDir = !!(data.stat.mode & 0040000);
    return h('.DirectoryEntry',
      { onclick: open(data.name_, isDir) },
      isDir
        ? h('strong', data.name_+'/')
        : [ data.name_, ' ', h('em', data.stat.size + ' b') ])
  }

  function open (name, isDir) {
    return function (event) {
      event.preventDefault();
      var location = require('path').join(frame.address, name);
      if (isDir) $.commands.add('directory', location);
    }
  }

})
