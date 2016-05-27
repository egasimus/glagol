module.exports = onKey;

var modifierKey = false;

function onKey (state, direction, event) {

  var up        = direction === 'up'
    , down      = direction === 'down'
    , Workspace = App.Model.Workspace;

  if (isModifierKey(event)) {

    modifierKey = down;

  } else {

    if (modifierKey) {

      if (down) {

        switch (event.code) {
          case 'KeyO':
            var visible = Workspace.Launcher.visible();
            if (!visible) {
              Workspace.Launcher.visible.set(true);
              Workspace.Launcher.focused.set(true);
              Workspace.Launcher.mode.set('Open');
            } else {
              Workspace.Launcher.visible.set(false);
            }
            break;
        }

      } else if (up) {

        // keyup handlers

      }

    } else {

      switch (event.code) {
        case 'Escape':
          if (Workspace.Launcher.focused()) {
            Workspace.Launcher.visible.set(false);
            Workspace.Launcher.focused.set(false);
          }
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
