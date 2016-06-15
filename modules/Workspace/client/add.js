(function (type, address) {

  address = (address || "").trim();
  App.API('Workspace/Open', type, address);

})
