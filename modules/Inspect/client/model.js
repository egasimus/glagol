module.exports = $.lib.model(

  { sockets:        {}

  , sessions:       {}

  , iframes:        {}

  , visibleColumns: { 'name_':    true
                    , 'source':   true
                    , 'compiled': true
                    , 'value':    true
                    , 'format':   true
                    , 'options':  true
                    }

  , displayOptions: { 'show sidebar':    true
                    , 'collapse links':  true
                    , 'expanded view':   true
                    , 'line numbers':    true
                    , 'snap horizontal': true
                    , 'snap vertical':   true
                    }
  });
