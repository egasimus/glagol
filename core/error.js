module.exports = defineError;

defineError("NOT_A_CONSTRUCTOR",
  "An object factory (e.g. File, Directory, Loader) is being" +
  " mistaken for a constructor and used with the `new` operator.",
  function (name) {
    return Error(
      name + " is not a constructor. Don't use the `new` operator.")
  })

defineError("ADD_NAMELESS_NODE",
  "Directories need each child node to have a name set.",
  function (path) {
    return Error("can't add nameless node to " + path)
  })

defineError("FILE_NOT_FOUND",
  "Looking for a file that isn't there.",
  function (location) {
    return Error("file not found: " + location)
  })

defineError("LOADER_UNSUPPORTED",
  "The loader has come across a filesystem object that is neither a file nor" +
  " a directory",
  function (location) {
    return Error(
      "can't load " + location + " because it's not a file or directory")
  })

defineError("FOREIGN_BODY",
  "An unknown object (i.e. not File or Directory) has been encountered in a" +
  " Directory tree.",
  function (node, parent) {
    var text = "foreign body in tree: " + JSON.stringify(node);
    if (parent) text += " parent: " + parent.path;
    return Error(text);
  })

defineError("TREE_NO_PARENT",
  "A Directory tree snapshot is being requested for a File which is not" +
  " added to a Directory.",
  function (name) {
    return Error("node " + name + " has no parent Directory.")
  })

defineError("TREE_CAN_NOT_SET",
  "You can't mutate a Directory's tree snapshot.",
  function (parentPath, nodeName) {
    return Error("Can't set value " + nodeName + " in snapshot of " + parentPath)
  })

function defineError (code, description, callback) {
  function errorFactory () {
    var error = callback.apply(this, arguments);
    error.code = errorFactory.code;
    error.description = errorFactory.description;
    return error;
  }
  Object.defineProperty(errorFactory, "name", { value: code });
  errorFactory.code = code;
  errorFactory.description = description;
  module.exports[code] = errorFactory;
  return errorFactory;
}
