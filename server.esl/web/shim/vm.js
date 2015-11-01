module.exports =

  { createContext: function (context) {
      return context }

  , runInContext: function (code, context, options) {
      eval(Object.keys(context).reduce(function(x, y) {
        return x + "var " + y + "=context['" + y + "'];";
      }, ""));
      return eval(code); } };
