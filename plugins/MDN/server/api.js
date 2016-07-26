module.exports = function (state, respond) {
  return {
    Search:
      function (query) {
        query = query.trim();
        require('request')(buildUrl(query), function (error, response, body) {
          respond(JSON.stringify(
            { plugin: 'MDN', data: { query: query, result: JSON.parse(body) }}))
        })
      }
  }
}

function buildUrl (query) {
  return 'https://developer.mozilla.org/en-US/search.json?highlight=false&q=' + query
}
