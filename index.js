module.exports = require('glagol')(__dirname,
  { eslisp: { transform:
    [ require('eslisp-dotify')
    , require('eslisp-camelify')
    , require('eslisp-propertify') ] } }).tree;
