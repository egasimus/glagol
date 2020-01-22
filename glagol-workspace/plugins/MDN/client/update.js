module.exports = function (App, data) {

  console.debug("MDN update", data);
  _.model.Searches.put(data.query, data.result);

}
