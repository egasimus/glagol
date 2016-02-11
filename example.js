#!/usr/bin/env node
!global.Glagol
  ? require('glagol')(__dirname).nodes[require('path').basename(__filename)]()()
  : (function () {
      console.log("hello")

      var x = setTimeout(function tick () {
        _.tick();
        x = setTimeout(tick, _.delay);
      });

      return function stop () {
        clearTimeout(x);
      };
      
    })
