(function CDNStyleSheet(href, integrity, crossOrigin) {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  if (integrity) link.integrity = integrity;
  if (crossOrigin) link.crossOrigin = crossOrigin;
  return link;
})
