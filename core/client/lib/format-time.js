(function formatTime (t) {
  var negative = t < 0;
  t = Math.round(Math.abs(t) * 1000) / 1000;
  var m  = Math.floor(t / 60)
    , s  = Math.floor(t % 60)
    , ms = Math.floor(t % 1 * 1000);
  m  = m < 10 ? "0" + m : m;
  s  = s < 10 ? "0" + s : s;
  ms = ms < 10 ? ("00" + ms) : ms < 100 ? ("0" + ms) : ms;
  return (negative ? '-' : '') + m + ':' + s + '.' + ms;
})
