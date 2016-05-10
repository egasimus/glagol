(function (state) {

  return h('.App.Blank',
    [ _.icon('refresh.fa-spin.fa-5x.fa-fw.Spinner') 
    , h('.LoadingText', state.Workspace.statusText) ])

})
