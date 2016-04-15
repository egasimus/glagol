(function (state) {

  return h('.StatusBar',
    [ h('.StatusBarNavigation',
      [ h('a.StatusBarButton', 'Console')
      , h('a.StatusBarButton', 'Tree') ])
    , h('.StatusBarText')
    , h('.StatusBarPresentation',
      [ h('a.StatusBarButton', '-' )
      , h('a.StatusBarButton', '12px')
      , h('a.StatusBarButton', '+') ]) ]);

})
