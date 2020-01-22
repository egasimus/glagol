Glagol.events.once('changed', _.reload(__filename));

module.exports = function () {
  console.debug.apply(console, ['adding stylesheet:'].concat(arguments));
  document.head.appendChild($.lib.cdnStylesheet.apply(null, arguments));
}
