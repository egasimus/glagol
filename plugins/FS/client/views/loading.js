module.exports = function (callback) {
  return function (frame, index) {
    var file;
    if (file = App.Model.FS.Files()[frame.address]) {
      return callback(frame, index, file);
    } else {
      App.API('FS/GetInfo', frame.address);
      return 'loading...'
    }
  }
}
