(function (src) {

  return h('.AudioPlayer',
    [ h('.AudioPlayerButton', { onclick: playback }, '▶')
    , h('.AudioPlayerInfo', require('path').basename(src))
    , h('audio', { src: 'http://localhost:1615/file?path=' + src, controls: true })
    ]);

  function playback (event) {
    event.preventDefault();
    var audio = event.target.parentElement.querySelector('audio');
    if (audio.paused) audio.play(); else audio.pause();
  }

})
