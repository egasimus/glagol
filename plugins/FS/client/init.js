(function init () {

  App.Workspace.registerFrameType('directory',   _.views.directory);
  App.Workspace.registerFrameType('sound',       _.views.sound);
  App.Workspace.registerFrameType('image',       _.views.image);
  App.Workspace.registerFrameType('textEditor',  _.views.textEditor);
  App.Workspace.registerFrameType('hexEditor',   _.views.hexEditor);
  App.Workspace.registerFrameType('file',        _.views.file);

})
