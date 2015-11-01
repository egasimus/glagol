#!/usr/bin/env node

var options =
  { eslisp:
    { transform:
      [ require('eslisp-camelify')
      , require('eslisp-propertify') ] }};

var app = require('glagol').Directory(__dirname, options);

app.tree()['main'](app);
