(function (frame, index) {

  var directory = App.Model.FS.Directories()[frame.address];

  return [
    h('.Directory_Toolbar',
      [ h('button', $.lib.icon('chevron-left'))
      , h('button', { onclick: refresh }, $.lib.icon('refresh'))
      , h('button', $.lib.icon('chevron-right'))
      , when(frame.address !== '/',
          h('button', { onclick: goUp }, $.lib.icon('chevron-up')))
       ]),
    h('.Directory', directory
      ? directory.items.length > 0
        ? [ header(), body() ]
        : empty()
      : noData()),
    ];

  // fragments

  function empty () {
    return h('.Directory_Empty',
      [ $.lib.icon('info-circle')
      , 'This directory is empty.' ])
  }

  function noData () {
    return h('.Directory_Empty',
      [ $.lib.icon('exclamation-circle')
      , "This directory's contents have not been loaded. "
      , "Hit 'Reload' to try again." ]);
  }

  function header () {
    h('header.FrameHeader',
     [ $.lib.icon('folder-open.fa-2x')
     , h('input.FrameAddress',
       { onchange: changeAddress
       , value:    frame.address })
     , h('.FrameClose', { onclick: remove }, '×')
     ])
  }

  function body () {
    h('table.Directory_Body',
      [ directory.items.map(dir)
      , directory.items.map(file) ])
  }

  function entry (onclick, body) {
    return h('tr.Directory_Entry', { onclick: onclick }, body);
  }

  function file (data) {
    if (!!(data.stat.mode & 0040000)) return;
    return entry(open(data.name_, false),
      [ h('.Directory_Entry_Name', data.name_)
      , h('.Directory_Entry_Type', data.type)
      , h('.Directory_Entry_Size', data.stat.size + ' B') ])
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

  // handlers

  function refresh (event) {
    event.preventDefault();
    $.modules.fs.refresh(frame, index);
  }

  function changeAddress (event) {
    event.preventDefault();
    API('change', index, 'address', event.target.value);
  }

  function remove (event) {
    event.preventDefault();
    $.modules.workspace.remove(index);
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

  // helpers

  function when (what, then) {
    return what ? then : null;
  }

})
