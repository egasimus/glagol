document.replaceChild(require('virtual-dom/create-element')((function(){
  var h = require('virtual-dom/h');
  return h('html', h('head'), h('body', h('p', 'foo')))
})()), document.firstChild);
