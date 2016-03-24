(function (state) {

  state = state || {};

  var appStyle =
    { fontFamily: 'monospace', fontSize: '10px' }

  var tableStyle =
    { margin: 0, color: 'red', fontSize: '10px'
    , width: '100%', height: '100%' }

  var cellStyle =
    { textAlign: 'center' }

  var blankBodyStyle =
    { height:         '100%'
    , display:        'flex'
    , flexDirection:  'column'
    , justifyContent: 'center'
    , alignItems:     'center' }

  var buttonStyle =
    { fontFamily: 'monospace'
    , fontWeight: 'bold'
    , background: 'white'
    , border: '2px solid #555'
    , color: '#111'
    , margin: '3px'
    , padding: '3px 6px'
    , cursor: 'pointer' }

  var inputStyle =
    { fontFamily: 'monospace'
    , fontWeight: 'bold'
    , background: 'white'
    , border: 'none'
    , borderBottom: '2px solid #aaa'
    , textAlign: 'center'
    , color: '#333' }

  var body;
  if (state.session) {
    body =
      h('table.Body',
        { style: tableStyle },
        [0,1,2,3].map(function (i) {
          return h('tr', [0,1,2,3].map(function (j) {
            return h('td',
              { style: cellStyle },
              ''+i+' '+j) })) }));
  } else {
    body =
      h('.Body',
        { style: blankBodyStyle },
        [ h('h1', 'Glagol Inspector')
        , h('form',
          [ h('input#session-id',
            { style:       inputStyle
            , type:        'text'
            , placeholder: '[HOST:]PORT' })
          , h('button',
              { style: buttonStyle
              , onclick: function (e) {
                  e.preventDefault();
                  var address = document.getElementById('session-id').value;
                  console.debug('connect to session', address);
                  API('session/connect', address).done(function () {
                    console.log("connected")
                  });
                }}
              , 'connect')]) ]);
  }

  return h('.App', { style: appStyle }, body);

})
