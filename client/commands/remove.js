(function (index) { return new Promise(function (win, fail) {
  API('remove', index).done(
    function () {
      console.debug('removed', index)
      win(index); },
    function (err) {
      console.debug('could not remove', index + ':', err);
      fail([index, err]); }) }) })
