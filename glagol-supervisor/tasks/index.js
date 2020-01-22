module.exports = require('glagol')(
  require('path').resolve(__dirname, 'tasks'),
  { formats: { null: require('./parse.js') }});
