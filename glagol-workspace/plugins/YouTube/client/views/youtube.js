module.exports = function () {

  return h('.YouTube',
    [ h('.YouTube_Body',
      [ h('.YouTube_Header',
        [ $.lib.icon('youtube.fa-2x')
        , h('input.YouTube_Address')
        , h('.Frame_Close', { onclick: close }, '×') ])
      , h('.YouTube_Video',
          h('iframe',
            { width: 420
            , height: 315
            , src: 'https://youtube.com/embed/KMU0tzLwhbE'
            , frameBorder: 0 }))
      , h('.YouTube_Comments') ])]);

  function close () {}

}
