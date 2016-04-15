(function (state) {
  return h('.Session',
    state.focusedSession ?
      h('table',
        [ h('tr',
          [ h('th', 'name')
          , h('th', 'format')
          , h('th', 'source')
          , h('th', 'compiled')
          , h('th', 'value')
          , h('th', 'options')
          ])
        ].concat(_.tree(state.sessions[state.focusedSession].root)))
      : null) })
