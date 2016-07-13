module.exports = $.lib.model(

  { Status:       "loading"

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
