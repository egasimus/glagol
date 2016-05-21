(function () {

  var options = require('../../options.js');
  $.log(options);

  require('mkdir-p').sync(options.pids);

  var glagol = require('glagol')
    , state  = glagol(options.pids);
  //state.options.formats = { null: require('glagol/formats/json') };
  state.events.onAny(function (node) { _.task[this.event](node); });

  process.stdin.resume();

})
