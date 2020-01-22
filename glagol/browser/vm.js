module.exports =

  { createContext: function (context) {
      return context }

  , runInContext: function (code, context, options) {
      var srcurl = options.filename ? "\n//# sourceURL=" + options.filename : ""
      try {
        eval(Object.keys(context).reduce(function(x, y) {
          return x + "var " + y + "=context['" + y + "'];";
        }, "") + srcurl);
      } catch (e) {
        console.error(e);
      }
      try {
        return eval(code + srcurl);
      } catch (e) {
        if (options.filename) e.message += " (from " + options.filename + ")";
        console.error(e);
      } } };
