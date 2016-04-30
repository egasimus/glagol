(function (frame, index) {

  console.log(App.model.files()[frame.address]);

  return h('.File', h('img', { src: '/file/' + frame.address }));

})
