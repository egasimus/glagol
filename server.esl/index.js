#!/usr/bin/env node

var options =
  { eslisp:
    { transform:
      [ require('eslisp-camelify')
      , require('eslisp-propertify') ] }};

var app = require('glagol').Directory('.', options);

console.log(app.nodes['web'].nodes['bundle.esl'].compiled)

app.tree()['main'](app);
