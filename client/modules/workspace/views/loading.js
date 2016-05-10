(function (state) {

  return h('.App.Blank',
    [ $.lib.icon('refresh.fa-spin.fa-5x.fa-fw.Spinner')
    , h('.LoadingText', state.Workspace.statusText) ])

})
