var welcome = module.exports = function (state) {

  return h('.App.Blank',
    [ h('h1', 'glagol')
    , h('form', { onsubmit: command },
      [ h('input.CommandInput#command',
        { type:        'text'
        , placeholder: placeholder()
        , onfocus:     focus
        , onblur:      blur })
      , h('button.CommandButton', 'enter')
      , state.Workspace.command.focused
        ? h('.CommandHints', welcome.hints.map(hint))
        : ''
      ]) ]);

  function focus () {
    App.Model.Workspace.command.focused.set(true);
  }

  function blur () {
    App.Model.Workspace.command.focused.set(false);
  }

  function placeholder () {
    return welcome.placeholders[
      Math.floor(Math.random() * welcome.placeholders.length)]
  }

  function hint (data) {
    return h('.CommandHint',
      [ h('.CommandHintTitle', data.title)
      , h('.CommandHintInfo',  data.info) ])
  }

  function command (event) {
    event.preventDefault();
    __.command(document.getElementById('command').value, null);
  }

}

welcome.placeholders =
  [ 'your will is my command'
  , 'abra cadabra'
  , 'let there be light'
  , 'got a lighter?'
  , 'just do it'
  , 'yeah guv?'
  , 'няма филм'
  , 'everything is true even this'
  , 'mind the djinn' ]

var br = h('br');

welcome.hints =
  [ { title: [ '1616', br
             , 'example.com:1616' ]
    , info:  'connect to glagol-remote-debugger at that port' }
  , { title: [ '/foo/bar', br
             , '~/baz/quux' ]
    , info:  'browse directory at that location' }
  , { title: 'anything else'
    , info:  'search for it with DuckDuckGo' } ];
