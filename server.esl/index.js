#!/usr/bin/env node

var options =
  { eslisp:
    { transform:
      [ require('eslisp-camelify')
      , require('eslisp-propertify') ] }};

var app = require('glagol').Directory(__dirname, options);

console.log(app.nodes['web'].nodes['body.esl'].compiled);

app.tree()['main'](app);
