(function () {

  $.log($.util.colors.bold('options:\n '),
    Object.keys($.options).map($.util.printOption.bind(null, $.options)).join('\n  '));

  $.util.mkdir($.options.pids);

  var glagol = require('glagol')
    , state  = glagol($.options.pids);
  //state.options.formats = { null: require('glagol/formats/json') };
  state.events.onAny(function (node) { _.event(this.event, node) });

  process.stdin.resume();

})
