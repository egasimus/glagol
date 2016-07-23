(function (frame, index) {

  var directory = App.Model.FS.Directories()[frame.address];

  if (!directory) {
    App.API('FS/GetInfo', frame.address)
    return 'loading...';
  }

  return [
    toolbar(),
    h('.Directory_Body',
      [ header()
      , directory ? directory.items.length > 0 ? body() : empty() : noData()])
  ];

  // fragments

  function toolbar () {
    var buttons = [ h('button', { onclick: refresh }, $.lib.icon('refresh')) ];
    if (directory) {
      buttons = buttons.concat(
        [ h('button', $.lib.icon('chevron-left'))
        , h('button', $.lib.icon('chevron-right'))
        , frame.address === '/' ? null :
            h('button', { onclick: goUp }, $.lib.icon('chevron-up'))
        , h('button', $.lib.icon('eye'))
        , !directory.git ? null :
            h('button' +
              (directory.git === 'unmodified' ? '.Git_Unmodified'  :
               directory.git === 'modified'   ? '.Git_Modified' : ''),
              'GIT')
        , !directory.package ? null :
            h('button', 'NPM')
        ]);
    }
    return h('.Directory_Toolbar', buttons);
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
    return h('header.Frame_Header',
     [ $.lib.icon('folder-open.fa-2x')
     , h('input.Frame_Address',
       { onchange: changeAddress
       , value:    frame.address })
     , h('.Frame_Close', { onclick: close }, '×')
     ])
  }

  function body () {
    return h('.Directory_Entries',
      { hookScroll: $.lib.scrollHook() },
      h('.Directory_Entries_Inner',
        h('table',
          [ directory.items.map(dir)
          , directory.items.map(file) ])));
  }

  function entry (body, onclick, fade) {
    return h('tr.Directory_Entry' + (fade ? '.Faded' : ''),
      { onclick: onclick },
      body);
  }

  function file (data) {
    if (!!(data.stats.mode & 0040000)) return;
    return entry(
      [ h('td.Directory_Entry_Name', data.name_)
      , h('td.Directory_Entry_Type', data.type)
      , h('td.Directory_Entry_Size', data.stats.size + ' B') ],
      open(data.name_, false),
      data.name_[0] === '.');
  }

  function dir (data) {
    if (!(data.stats.mode & 0040000)) return;
    return entry(
      [ h('td.Directory_Entry_Name.is-dir', data.name_ + '/')
      , h('td.Directory_Entry_Type',

          [ !data.package ? null :
              h('span.Directory_Entry_Label',
                [ 'npm '
                , (data.package.version
                  ? h('strong', data.package.version)
                  : '') ])

          , !data.git ? null :
              h('span.Directory_Entry_Label' +
                (data.git === 'unmodified' ? '.Git_Unmodified'  :
                 data.git === 'modified'   ? '.Git_Modified'    : ''),
                'git')

          , h('em', 'directory') ])

      , h('td.Directory_Entry_Size',
        data.files ? (data.files + ' items') : 'access denied') ],
      open(data.name_, true),
      data.name_[0] === '.');
  }

  // handlers

  function refresh (event) {
    event.preventDefault();
    App.API('FS/GetInfo', frame.address);
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

})
