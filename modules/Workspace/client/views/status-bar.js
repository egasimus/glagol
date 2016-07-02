(function (state) {

  return h('.StatusBar',
    [ h('.StatusBar_Group',
      [ h('button.StatusBar_Module', [ $.lib.icon('folder-open'), ' ', h('strong', 'o'), 'pen' ])
      , h('button.StatusBar_Module', [ $.lib.icon('rocket'),      ' ', h('strong', 'r'), 'un'  ])
      , h('button.StatusBar_Module', [ $.lib.icon('plus'),        ' ', h('strong', 'a'), 'dd'  ])
      ])
    , h('button.StatusBar_Module', [ $.lib.icon('info'), ' help' ])

      //h('.StatusBarNavigation',
      //[ h('a.StatusBarButton', 'Console')
      //, h('a.StatusBarButton', 'Tree') ])
    //, h('.StatusBar_Text', state.Workspace.StatusBar.text)
    //, h('.StatusBar_Modules', Object.keys($.modules).map(function (moduleName) {
        //return h('.StatusBar_Module', moduleName);
      //}))
    //, h('.StatusBarPresentation',
      //[ h('a.StatusBarButton', '-' )
      //, h('a.StatusBarButton', '12px')
      //, h('a.StatusBarButton', '+') ])
    ]);

})
