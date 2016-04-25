(function (frame, index) {

  return h('.Directory', App.model.directories()[frame.address].map(entry))

  function entry (name) {
    return h('.DirectoryEntry', name)
  }

})
