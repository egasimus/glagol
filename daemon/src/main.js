(function () {

  var options = require('../../options.js');
  $.log(options);

  require('mkdir-p').sync(options.pids);

  var glagol = require('glagol')
    , state  = glagol(options.pids);
  state.events.onAny(function (node) { _.update(this.event, node); });

  process.stdin.resume();

})
