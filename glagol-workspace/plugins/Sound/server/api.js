var id3 = require('id3_reader')

module.exports = function (state, respond) {

  return {
  
    GetMetadata:
      function (location) {
        location = resolve(location.trim());
        _.log('GetMetadata', location);
        id3.read(location, function (err, data) {
          if (err) return console.log(err);
          delete data.attached_picture;
          delete data.private_frame;
          update(data);
        })
      },

    GetWaveform:
      function (location) {
        location = resolve(location.trim());
        _.log('GetWaveform', location);
        update(null);
      }
  
  }

  function update (data) {
    respond(JSON.stringify({ plugin: 'Sound', data: data }))
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
