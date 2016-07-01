var id3 = require('id3_reader')

module.exports = function (state, respond) {

  return {
  
    GetMetadata:
      function (location) {
        location = resolve(location.trim());
        _.log('GetMetadata', location);
        id3.read(location, function (err, data) {
          if (err) throw err;
          delete data.attached_picture;
          delete data.private_frame;
          respond(JSON.stringify({ module: 'Sound', data: data }));
        })
      },

    GetWaveform:
      function (location) {
        location = resolve(location.trim());
        _.log('GetWaveform', location);
        data = null;
        respond(JSON.stringify({ module: 'Sound', data: data }))
      }
  
  }

}

function resolve (location) {
  if (location === '~') {
    location = os.homedir();
  } else if (location.indexOf('~/') === 0) {
    location = path.resolve(path.join(os.homedir(), location.slice(1)))
  }
  return location;
}
