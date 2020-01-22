module.exports = function (frame, index) {

  var query  = frame.address.trim()
    , result = __.model.Searches()[query];

  return h('.MDNBrowser',
    [ h('.Frame_Header',
      [ h('button.ToolbarButton', { onclick: refresh }, $.lib.icon('refresh'))
      , $.lib.icon('book.fa-2x')
      , h('input.Frame_Address',
        { onchange:    search
        , value:       query
        , placeholder: 'search MDN' })
      , h('.Frame_Close', { onclick: close }, '×') ])
    , h('.Frame_Body',
        result ? full() : empty() ) ]);

  function full () {
    var els = [];

    els.push(h('.MDNBrowser_Results_Info',
      [ h('strong', String(result.count))
      , ' results for '
      , h('strong', h('em', query))
      , '; showing '
      , h('strong', String(result.start))
      , ' to '
      , h('strong', String(result.end)) ]));

    els.push(h('.MDNBrowser_Results'),
      result.documents.map(searchResult));

    console.log(result.documents.map(searchResult))

    return els;
    //return h('div',
      //[ h('strong', 'Results: '), result.count ]),
  }

  function searchResult (result) {
    return h('.MDNBrowser_Result',
      [ h('strong.MDNBrowser_Result_Title', String(result.title))
      , h('em.MDNBrowser_Result_Excerpt',   String(result.excerpt)) ])
  }

  function empty () {
    //return 'Empty';
  }

  function search (event) {
    event.preventDefault();
    var query = event.target.value.trim();
    App.API('MDN/Search', query);
    console.log(App.Model.Workspace.Frames())
    App.Model.Workspace.Frames.get(index).put('address', query);
  }

  function refresh (event) {
    event.preventDefault();
    App.API('MDN/Search', frame.address)
  }

}
