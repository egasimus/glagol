#!/usr/bin/env node

var options = {
  eslisp: {
    transform:
      [ require('eslisp-camelify')
      , require('eslisp-propertify') ] }};

require('glagol').Directory('.', options).tree()['main'];
