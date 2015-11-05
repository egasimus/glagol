module.exports =

  { createContext: function (context) {
      return context }

  , runInContext: function (code, context, options) {
      try {
        eval(Object.keys(context).reduce(function(x, y) {
          return x + "var " + y + "=context['" + y + "'];";
        }, ""));
      } catch (e) {
        console.error(e);
      }
      try {
        return eval(code);
      } catch (e) {
        console.error(e);
      } } };
