module.exports = function (state, respond) {

  return {

    Search:
      function (query) {
        query = query.trim();
        respond(JSON.stringify({ plugin: 'MDN', data:
          { query: query, result: 'asdf' } }))
      }

  }

}
