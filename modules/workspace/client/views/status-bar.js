(function (state) {

  return h('.StatusBar',
    [ 
      //h('.StatusBarNavigation',
      //[ h('a.StatusBarButton', 'Console')
      //, h('a.StatusBarButton', 'Tree') ])
    , h('.StatusBar_Text', state.Workspace.StatusBar.text)
    , h('.StatusBar_Modules', Object.keys($.modules).map(function (moduleName) {
        return h('.StatusBar_Module', moduleName);
      }))
    //, h('.StatusBarPresentation',
      //[ h('a.StatusBarButton', '-' )
      //, h('a.StatusBarButton', '12px')
      //, h('a.StatusBarButton', '+') ])
    ]);

})
