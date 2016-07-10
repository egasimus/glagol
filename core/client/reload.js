module.exports = function (reason) {
  return function () {
    console.log('Reloading (' + reason + ')');
    window.location.reload()
  }
}
