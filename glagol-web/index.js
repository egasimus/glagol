var options =
  { formats: { '.esl': require('glagol-eslisp')({ extraTransformMacros:
    [ require('eslisp-dotify')
    , require('eslisp-camelify')
    , require('eslisp-propertify') ] }) } };

module.exports = require('glagol')(__dirname, options)();
