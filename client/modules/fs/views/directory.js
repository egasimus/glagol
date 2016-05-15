(function (frame, index) {

  var directory = App.Model.FS.directories()[frame.address];;

  return [
    h('.DirectoryToolbar',
      [ h('button', $.lib.icon('chevron-left'))
      , h('button', { onclick: refresh }, $.lib.icon('refresh'))
      , h('button', $.lib.icon('chevron-right'))
      , when(frame.address !== '/',
          h('button', { onclick: goUp }, $.lib.icon('chevron-up')))
       ]),
    h('.Directory', directory ? directoryBody() : noData()),
    ]

  function refresh (event) {
    event.preventDefault();
    $.modules.fs.refresh(frame, index);
  }

  function directoryBody () {
    return directory.items.length === 0
      ? h('.DirectoryEmpty', [ $.lib.icon('info-circle'), 'This directory is empty.' ])
      : [ h('header.FrameHeader',
          [ $.lib.icon('folder-open.fa-2x')
          , h('input.FrameAddress',
            { onchange: changeAddress
            , value:    frame.address })
          , h('.FrameClose', { onclick: remove }, '×')
          ])
        , h('.DirectoryBody',
          [ directory.items.map(dir)
          , directory.items.map(file) ]) ];
  }

  function changeAddress (event) {
    event.preventDefault();
    API('change', index, 'address', event.target.value);
  }

  function remove (event) {
    event.preventDefault();
    __.remove(index);
  }

  function noData () {
    return h('.DirectoryEmpty', [ $.lib.icon('exclamation-circle'), "This directory's contents have not been loaded. Hit 'Reload' to try again." ]);
  }

  function entry (onclick, body) {
    return h('tr.DirectoryEntry', { onclick: onclick }, body);
  }

  function file (data) {
    if (!!(data.stat.mode & 0040000)) return;
    return entry(open(data.name_, false),
      [ h('.DirectoryEntryName', data.name_)
      , h('.DirectoryEntryType', data.type)
      , h('.DirectoryEntrySize', data.stat.size + ' B') ])
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
    App.Workspace('change', index, 'address', location);
  }

  function open (name, isDir) {
    return function (event) {
      event.preventDefault();
      var location = require('path').join(frame.address, name);
      if (isDir) {
        App.Workspace('change', index, 'address', location);
      } else {
        $.modules.workspace.add('file', location);
      }
    }
  }

  function when (what, then) {
    return what ? then : null;
  }

})
