module.exports = function (data, index) {
  return h('section.Frame' + when(data.error, '.FrameWithError'),
    { dataset: { type: frame.type, address: frame.address } },
    [ module.exports.header(data, index)
    , module.exports.body(data, index)
    , module.exports.toolbar(data, index) ]);
}

{ header:
    function (data, index) {
      return h('header.FrameHeader',
        [ h('.FrameTitle',
          [ frameType()
          , ' '
          , h('input.FrameAddress',
            { onchange: changeAddress
            , value: frame.address 
            , size: 40 }) ])
        , h('.FrameClose', { onclick: remove }, '×')]) }
, body:
    function (data, index) {
      h('.FrameBody')//, _.frames[frame.type](frame, index))
    }
, toolbar:
    function (data, index) {}
}
