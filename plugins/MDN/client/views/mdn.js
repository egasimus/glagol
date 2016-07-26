module.exports = function (frame, index) {

  var query = frame.address.trim();

  return h('.MDNBrowser',
    [ h('.Frame_Header',
      [ h('button.ToolbarButton', { onclick: refresh }, $.lib.icon('refresh'))
      , $.lib.icon('book.fa-2x')
      , h('input.Frame_Address',
        { onchange:    search
        , value:       query
        , placeholder: 'search MDN'})
      , h('.Frame_Close', { onclick: close }, '×') ])
    , h('.Frame_Body',
        { style: { minWidth: 400, minHeight: 600 } },
        h('pre', String(__.model.Searches()[query])))
    ])

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
