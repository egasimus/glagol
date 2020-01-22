module.exports = { formats:
  { '.esl': require('glagol-eslisp')({ extraTransformMacros:
    [ require('eslisp-dotify')
    , require('eslisp-camelify')
    , require('eslisp-propertify') ] }) } }

