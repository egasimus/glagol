(function (frame, index) {

  var directory = App.model.directories()[frame.address];

  return h('.Directory', directory.map(entry))

  function entry (data) {
    var isDir = !!(data.stat.mode & 0040000);
    return h('.DirectoryEntry',
      isDir ? h('strong', data.name_+'/') : data.name_)
  }

})
