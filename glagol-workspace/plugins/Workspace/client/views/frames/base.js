module.exports = function (data, index) {
  return h('section.Frame' + when(data.error, '.FrameWithError'),
    { dataset: { type: frame.type, address: frame.address } },
    [ module.exports.header(data, index)
    , module.exports.body(data, index)
    , module.exports.toolbar(data, index) ]);
}

{ header:
    function (data, index) {
      return h('header.Frame_Header',
        [ h('.Frame_Title',
          [ frameType()
          , ' '
          , h('input.Frame_Address',
            { onchange: changeAddress
            , value: frame.address 
            , size: 40 }) ])
        , h('.Frame_Close', { onclick: remove }, '×')]) }
, body:
    function (data, index) {
      h('.Frame_Body')//, _.frames[frame.type](frame, index))
    }
, toolbar:
    function (data, index) {}
}
