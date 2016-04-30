(function (frame, index) {

  var file = App.model.files()[frame.address];

  var body = 'unknown file type: ' + file.type;

  switch (file.type) {
    case 'audio/mpeg':
    case 'audio/x-wav':
      body = h('audio', { controls: true })
      addSrc();
      break;
    case 'image/png':
    case 'image/jpeg':
      body = h('img')
      addSrc();
      break;
  }

  console.log(body)

  return h('.File', body);

  function addSrc () {
    body.properties.src = '/file/' + file.name_;
  }

})
