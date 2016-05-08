var welcome = module.exports = function (state) {

  return h('.App.Blank',
    [ h('h1', 'glagol')
    , h('form', { onsubmit: djinn },
      [ h('input.DjinnInput#djinn',
        { type:        'text'
        , placeholder: placeholder()
        , onfocus:     focus
        , onblur:      blur })
      , h('button.DjinnButton', 'enter')
      , state.Session.djinn.focused
        ? h('.DjinnHints', welcome.hints.map(hint))
        : ''
      ]) ]);

  function focus () {
    App.Model.Session.djinn.focused.set(true);
  }

  function blur () {
    App.Model.Session.djinn.focused.set(false);
  }

  function placeholder () {
    return welcome.placeholders[
      Math.floor(Math.random() * welcome.placeholders.length)]
  }

  function hint (data) {
    return h('.DjinnHint',
      [ h('.DjinnHintTitle', data.title)
      , h('.DjinnHintInfo',  data.info) ])
  }

  function djinn (event) {
    event.preventDefault();
    $.commands.djinn(document.getElementById('djinn').value, null);
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
  , 'everything is true even this' ]

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
