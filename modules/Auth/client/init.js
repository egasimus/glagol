module.exports = function () {
  // determine user id
  var id = require('cookie').parse(document.cookie)['user-id'];
  console.info("User ID:", id);
  __.Workspace.model.userId.set(id);
}
