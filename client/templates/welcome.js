module.exports = function (state) {

  return h('.App.Blank',
    [ h('h1', 'glagol')
    , h('form',
      [ h('input.DjinnInput#djinn',
        { type:        'text'
        , placeholder: placeholder()
        , onfocus:     focus
        , onblur:      blur })
      , h('button.DjinnButton',
        { onclick: function (event) {
            event.preventDefault();
            var address = document.getElementById('djinn').value
            $.commands.add('glagol', address); } }
        , 'enter')
      , state.djinn.focused || true
        ? h('.DjinnHints', module.exports.hints.map(hint))
        : ''
      ]) ]);

  function focus () {
    App.model.djinn.focused.set(true);
  }

  function blur () {
    App.model.djinn.focused.set(false);
  }

  function placeholder () {
    return module.exports.placeholders[
      Math.floor(Math.random() * module.exports.placeholders.length)]
  }

  function hint (data) {
    return h('.DjinnHint',
      [ h('.DjinnHintTitle', data.title)
      , h('.DjinnHintInfo',  data.info) ])
  }

}

module.exports.placeholders =
  [ 'your will is my command'
  , 'abra cadabra'
  , 'let there be light'
  , 'got a lighter?'
  , 'just do it'
  , 'yeah boss?'
  , 'няма филм' ]

var br = h('br');

module.exports.hints =
  [ { title: [ '1616', br
             , 'example.com:1616' ]
    , info:  'connect to glagol-remote-debugger at that port' }
  , { title: [ '/foo/bar', br
             , '~/baz/quux' ]
    , info:  'browse directory at that location' }
  , { title: 'anything else'
    , info:  'search for it with DuckDuckGo' } ];
