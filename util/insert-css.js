(function (css, prepend) {

  var elem = document.createElement('style');
  elem.setAttribute('type', 'text/css');
  if ('textContent' in elem) {
    elem.textContent = css;
  } else {
    elem.styleSheet.cssText = css;
  }

  var head = document.getElementsByTagName('head')[0];
  if (prepend) {
    head.insertBefore(elem, head.childNodes[0]);
  } else {
    head.appendChild(elem);
  }

  return elem;

})
