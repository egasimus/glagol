(function (index) { return new Promise(function (win, fail) {
  API('remove', index);
  win();
}) })
