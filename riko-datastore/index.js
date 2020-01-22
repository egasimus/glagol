module.exports = function (data) {

  var datastore = data || {}
    , rules     = {}
    , watchers  = {}

  var api =
    { get:       get
    , set:       set
    , rule:      rule
    , watch:     watch
    , valid:     valid
    , notify:    notify }

  return api;

  function get (key) {
    var value = datastore[key];
    if (typeof value === 'function') value = value(datastore);
    return value;
  }

  function set (key, value) {
    if (valid(key, value)) {
      datastore[key] = value;
      notify(key, value);
      return api;
    }
  }

  function rule (key, rule) {
    rules[key] = rules[key] || [];
    rules[key].push(rule);
    return api;
  }

  function notify (key, callback) {
    watchers[key] = watchers[key] || [];
    watchers[key].push(callback);
    return api;
  }

  function valid (key, value) {
    var ruleKeys = Object.keys(rules);
  }

  function notify (key, value) {
    var watcherKeys = Object.keys(watchers);
  }

}
