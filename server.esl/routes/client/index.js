require('require-like').install(require("__glagol_deps"));
var app = require('glagol-cryo/lib/thaw')(require("__glagol_app"));
app.tree();
console.log(app);
root.main(app, conn);
