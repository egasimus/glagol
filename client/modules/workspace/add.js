(function (type, address) {

  address = (address || "").trim();
  App.Workspace('add', type, address);

})
