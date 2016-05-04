(function (frame, index) {

  var directory = App.model.directories()[frame.address];;

  return [
    h('.Directory', directory ? directoryBody() : noData()),
    h('.DirectoryToolbar',
      h('button', { onclick: $.cmd('refresh', frame, index) }, 'Refresh'))
    ]

  function directoryBody () {
    return [
      when(frame.address !== '/',
        h('.DirectoryEntry',
          { onclick: goUp },
          [ h('strong', '../')
          , h('em', 'parent directory') ])),
      directory.items.map(dir),
      directory.items.map(file)
    ]
  }

  function noData () { return 'no data' }

  function entry (onclick, body) {
    return h('tr.DirectoryEntry', { onclick: onclick }, body);
  }

  function file (data) {
    if (!!(data.stat.mode & 0040000)) return;
    return entry(open(data.name_, false),
      [ h('.DirectoryEntryName', data.name_)
      , h('.DirectoryEntryType', data.type)
      , h('.DirectoryEntrySize', data.stat.size + ' b') ])
  }

  function dir (data) {
    if (!(data.stat.mode & 0040000)) return;
    return entry(open(data.name_, true),
      [ h('strong.DirectoryEntryName', data.name_ + '/')
      , h('.DirectoryEntryType',
          [ when(data.package, h('span.DirectoryEntryLabel', 'npm'))
          , when(data.git,     h('span.DirectoryEntryLabel', 'git'))
          , h('em', 'directory') ])
      , h('.DirectoryEntrySize', data.files + ' files')
      ])
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
      if (isDir) {
        App.model.frames.get(index).put('address', location)
        FS('read', location);
      } else {
        $.commands.add('file', location);
      }
    }
  }

  function when (what, then) {
    return what ? then : null;
  }

})
