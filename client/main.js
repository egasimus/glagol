(function () {

  // init client framework
  window.App = $.lib.client.init(Glagol);

  // inject codemirror stylesheet; TODO from node_modules
  var codemirrorStyle = document.createElement('link');
  codemirrorStyle.rel  = 'stylesheet';
  codemirrorStyle.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/codemirror.css';
  document.head.appendChild(codemirrorStyle);

  // init API
  // TODO automatically add API to Glagol pseudo-globals instead of the window
  // object. The problem here is that modifying options objects is tricky; and
  // furthermore does not automatically invalidate evaluation caches. Things
  // to fix in Glagol core.
  var API    = $.lib.api.init(Glagol)
    , socket = API.socket
    , API    = window.API = API.API;

  // reload page when socket closes
  socket.onclose = function () { window.location.reload() }

  // subscribe to server api
  // TODO replace with new api framework
  API('subscribe', function (data) {
    _.commands.update(data)
  }).done(function (data) {
    console.debug("subscribed to server");
    _.commands.update(data);
  });

  // what these guys have seen prolly can not be unseen
  return {
    API: API,
    App: App,
  };

})
