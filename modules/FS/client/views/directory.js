(function (frame, index) {

  var directory = App.Model.FS.Directories()[frame.address];

  return [
    toolbar(),
    h('.Directory_Body',
      [ header()
      , directory ? directory.items.length > 0 ? body() : empty() : noData()])
  ];

  // fragments

  function toolbar () {
    return h('.Directory_Toolbar',
      [ h('button', { onclick: refresh }, $.lib.icon('refresh'))
      , h('button', $.lib.icon('chevron-left'))
      , h('button', $.lib.icon('chevron-right'))
      , when(frame.address !== '/',
          h('button', { onclick: goUp }, $.lib.icon('chevron-up')))
      , h('button', $.lib.icon('eye'))
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
      , "We don't know what's in this directory. ", h('br'), "Hit "
      , h('button', { onclick: refresh }, [ $.lib.icon('refresh'), "Reload" ])
      , " to try to find out." ]);
  }

  function header () {
    return h('header.FrameHeader',
     [ $.lib.icon('folder-open.fa-2x')
     , h('input.FrameAddress',
       { onchange: changeAddress
       , value:    frame.address })
     , h('.FrameClose', { onclick: close }, '×')
     ])
  }

  function body () {
    return h('.Directory_Entries', h('table',
      [ directory.items.map(dir)
      , directory.items.map(file) ]))
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
    App.API('FS/Read', frame.address);
  }

  function changeAddress (event) {
    event.preventDefault();
    App.API('Workspace/Change', frame.id, 'address', event.target.value);
  }

  function close (event) {
    event.preventDefault();
    App.API('Workspace/Close', frame.id);
  }

  function goUp (event) {
    event.preventDefault();
    var location = require('path').dirname(frame.address);
    App.API('Workspace/Change', frame.id, 'address', location);
  }

  function open (name, isDir) {
    return function (event) {
      event.preventDefault();
      var location = require('path').join(frame.address, name);
      if (isDir) {
        App.API('Workspace/Change', frame.id, 'address', location);
      } else {
        App.API('Workspace/Open', 'file', location);
      }
    }
  }

  // helpers

  function when (what, then) {
    return what ? then : null;
  }

})
