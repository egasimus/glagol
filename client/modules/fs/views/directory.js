(function (frame, index) {

  var directory = App.Model.FS.Directories()[frame.address];

  return [
    toolbar(),
    h('.Directory',
      [ header()
      , directory ? directory.items.length > 0 ? body() : empty() : noData()])
  ];

  // fragments

  function toolbar () {
    return h('.Directory_Toolbar',
      [ h('button', $.lib.icon('chevron-left'))
      , h('button', { onclick: refresh }, $.lib.icon('refresh'))
      , h('button', $.lib.icon('chevron-right'))
      , when(frame.address !== '/',
          h('button', { onclick: goUp }, $.lib.icon('chevron-up')))
       ]);
  }

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
    return h('header.FrameHeader',
     [ $.lib.icon('folder-open.fa-2x')
     , h('input.FrameAddress',
       { onchange: changeAddress
       , value:    frame.address })
     , h('.FrameClose', { onclick: remove }, '×')
     ])
  }

  function body () {
    return h('table.Directory_Body',
      [ directory.items.map(dir)
      , directory.items.map(file) ])
  }

  function entry (onclick, body) {
    return h('tr.Directory_Entry', { onclick: onclick }, body);
  }

  function file (data) {
    if (!!(data.stat.mode & 0040000)) return;
    return entry(open(data.name_, false),
      [ h('td.Directory_Entry_Name', data.name_)
      , h('td.Directory_Entry_Type', data.type)
      , h('td.Directory_Entry_Size', data.stat.size + ' B') ])
  }

  function dir (data) {
    if (!(data.stat.mode & 0040000)) return;
    return entry(open(data.name_, true),
      [ h('td.Directory_Entry_Name.is-dir', data.name_ + '/')
      , h('td.Directory_Entry_Type',
          [ when(data.package, h('span.Directory_Entry_Label', 'npm'))
          , when(data.git,     h('span.Directory_Entry_Label', 'git'))
          , h('em', 'directory') ])
      , h('td.Directory_Entry_Size', data.files ? (data.files + ' items') : 'access denied')
      ])
  }

  // handlers

  function refresh (event) {
    event.preventDefault();
    $.modules.fs.refresh(frame, index);
  }

  function changeAddress (event) {
    event.preventDefault();
    App.Workspace('change', frame.id, 'address', event.target.value);
  }

  function remove (event) {
    event.preventDefault();
    App.Workspace('remove', frame.id);
  }

  function goUp (event) {
    event.preventDefault();
    var location = require('path').dirname(frame.address);
    App.Workspace('change', frame.id, 'address', location);
  }

  function open (name, isDir) {
    return function (event) {
      event.preventDefault();
      var location = require('path').join(frame.address, name);
      if (isDir) {
        App.Workspace('change', frame.id, 'address', location);
      } else {
        App.Workspace('add', 'file', location);
      }
    }
  }

  // helpers

  function when (what, then) {
    return what ? then : null;
  }

})
