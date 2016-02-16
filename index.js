module.exports = require('glagol')(__dirname,
  { formats: { '.esl': require('glagol-eslisp')({ extraTransformMacros:
    [ require('eslisp-dotify')
    , require('eslisp-camelify')
    , require('eslisp-propertify') ] }) } })();
