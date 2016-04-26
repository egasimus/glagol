(function (frame, index) {

  var directory = App.model.directories()[frame.address] || [];

  return h('.Directory',
    [ frame.address !== '/'
      ? h('.DirectoryEntry',
        { onclick: goUp },
        [ h('strong', '../')
        , h('em', 'parent directory') ])
      : ''
    , directory.map(dir)
    , directory.map(file) ])

  function file (data) {
    if (!!(data.stat.mode & 0040000)) return;
    return h('.DirectoryEntry',
      { onclick: open(data.name_, false) },
      [ data.name_, ' ', h('em', data.stat.size + ' b') ])
  }

  function dir (data) {
    if (!(data.stat.mode & 0040000)) return;
    return h('.DirectoryEntry',
      { onclick: open(data.name_, true) },
      h('strong', data.name_ + '/'));
  }

  function goUp (event) {
    event.preventDefault();
    var location = require('path').dirname(frame.address);
    App.model.frames.get(index).put('address', location);
  }

  function open (name, isDir) {
    return function (event) {
      event.preventDefault();
      var location = require('path').join(frame.address, name);
      $.commands.add(isDir ? 'directory' : 'file', location);
    }
  }

})
