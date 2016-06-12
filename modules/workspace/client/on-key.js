module.exports = onKey;

var modifierKey = false;

function onKey (state, direction, event) {

  var up        = direction === 'up'
    , down      = direction === 'down'
    , Workspace = App.Model.Workspace
    , Launcher  = Workspace.Launcher
    , Switcher  = Workspace.Switcher;

  if (isModifierKey(event)) {

    modifierKey = down;

  } else {

    if (modifierKey) {

      if (down) {

        switch (event.code) {
          case 'KeyO':
          case 'KeyR':
            var visible = Launcher.visible()
              , mode    = { KeyO: 'Open', KeyR: 'Run' }[event.code];
            if (visible && mode === Launcher.mode()) {
              Launcher.visible.set(false);
            } else {
              Launcher.visible.set(true);
              Launcher.focused.set(true);
              Launcher.mode.set(mode);
              Launcher.input.set('');
            }
            break;

          case 'Tab':
            Switcher.visible.set(true);
        }

      } else if (up) {

        switch (event.code) {
          case 'Tab':
            Switcher.visible.set(false);
        }

      }

    } else {

      switch (event.code) {
        case 'Escape':
          if (Launcher.focused()) {
            Launcher.visible.set(false);
            Launcher.focused.set(false);
          }
          break;
        case 'F5':
          window.location.reload();
          break;
        case 'F12':
          nativeRequire('electron').remote.getCurrentWindow().toggleDevTools();
          break;
      }

    }

  }

}

function isModifierKey (event) {
  return (event.code === 'Backslash')
    ? true
    : process.versions.electron
      ? (event.code === 'AltLeft' || event.code === 'AltRight')
        ? true
        : false
      : false;
}
