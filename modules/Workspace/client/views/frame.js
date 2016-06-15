(function (frame, index) {

  return h('section.Frame' + (frame.error ? '.FrameWithError' : ''),
    { dataset: { type: frame.type, address: frame.address } },
    __.maps.types(frame.type, { frame: frame, index: index }));
    //[ _.frameHeader(frame, index)
    //, _.frameError(frame, index)
    //, h('.FrameBody', __.getViewForType(frame.type, { frame: frame, index: index}))
    //]);

});
