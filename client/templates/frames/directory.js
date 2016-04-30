(function (frame, index) {

  var directory = App.model.directories()[frame.address] || [];

  return [
    h('.Directory',
      [ frame.address !== '/'
        ? h('.DirectoryEntry',
          { onclick: goUp },
          [ h('strong', '../')
          , h('em', 'parent directory') ])
        : ''
      , directory.map(dir)
      , directory.map(file) ]),
    h('.DirectoryToolbar',
      h('button', { onclick: $.cmd('refresh', frame, index) }, 'Refresh'))
    ]

  function entry (onclick, body) {
    return h('tr.DirectoryEntry', { onclick: onclick }, body);
  }

  function file (data) {
    if (!!(data.stat.mode & 0040000)) return;
    return entry(open(data.name_, false),
      [ h('.DirectoryEntryName', data.name_)
      , ' '
      , h('.DirectoryEntryType', data.type)
      , ' '
      , h('.DirectoryEntrySize', data.stat.size + ' b') ])
  }

  function dir (data) {
    if (!(data.stat.mode & 0040000)) return;
    return entry(open(data.name_, false),
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
