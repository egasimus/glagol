(function () {

  return h('.App.Blank',
    [ h('h1', 'Glagol')
    , h('form',
      [ h('input#session-id',
        { type:        'text'
        , placeholder: '[HOST:]PORT' })
      , h('button',
        { onclick: function (event) {
            event.preventDefault();
            var address = document.getElementById('session-id').value
            $.commands.add('glagol', address); } }
        , 'connect')]) ]);

})
