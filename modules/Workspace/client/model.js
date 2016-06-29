module.exports = require('riko-mvc').M(

  { userId:       null

  , Status:       "loading"

  , Launcher:     { visible: false
                  , focused: false
                  , mode:    'menu'
                  , input:   ''
                  }

  , Switcher:     { visible: false }

  , StatusBar:    { visible: true
                  , text:    ''
                  }

  , Frames:       []

  , focusedFrame: 0

  })
