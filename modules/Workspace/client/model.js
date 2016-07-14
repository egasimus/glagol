module.exports = $.lib.model(

  { Status:       "loading"

  , MainMenu:     { visible: false }

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
