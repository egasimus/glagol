module.exports = function (state) {

  var state    = state.Workspace.Launcher
    , Launcher = App.Model.Workspace.Launcher;

  return h('.Launcher.Visible',
    h('input.Launcher_Input',
      { type:        'text'
      , value:       state.input
      , placeholder: 'Enter path, query or command'
      , onblur:      hide
      , onkeyup:     update
      , hookFocus:   require('focus-hook')() }));

  function item (text) {
    var split = text.split('&');
    return h('.Launcher_Item',
      [ split[0]
      , h('strong', h('u', (split[1] || '')[0]))
      , (split[1] || '').slice(1) ]) }

  function hide () {
    Launcher.visible.set(false); }

  function update (event) {
    if (event.code === 'Escape') {
      hide();
      return; }

    if (event.code === 'Enter') {
      var value = document.getElementsByClassName('Launcher_Input')[0].value
      console.info('launch', value);
      hide();
      __.maps.opener(value)
      return; }

    Launcher.input.set(el.value); }

}
