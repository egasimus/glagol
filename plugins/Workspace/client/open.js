module.exports = function (type, address) {
  return function (event) {
    event.preventDefault();
    address = (address || "").trim();
    App.API('Workspace/Open', type, address);
  }
}
