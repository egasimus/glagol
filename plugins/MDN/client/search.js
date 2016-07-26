module.exports = function (query) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', buildUrl(query), true);
  xhr.onload = function () {
    _.model.Searches.put(query, JSON.parse(xhr.response))
  }
  xhr.send();
}

function buildUrl (query) {
  return 'https://developer.mozilla.org/en-US/search.json?q=' + query
}
