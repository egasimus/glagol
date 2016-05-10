(function (index) { return new Promise(function (win, fail) {
  App.Workspace('remove', index);
  win();
}) })
