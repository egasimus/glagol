module.exports = function (state) {

  return h('.App.Blank',
    [ h('strong', 'glagol. consciousness expansion desktop environment.')
    , h('em', 'splash screen = money shot')
    , h('em', [ 'solipsistic public license', h('strong', ' &| gpl v3') ])
    , $.lib.icon('refresh.fa-spin.fa-5x.fa-fw.Spinner')
    , h('.LoadingText', state.Workspace.statusText) ])

}

Glagol.events.once('changed', __.reload);
