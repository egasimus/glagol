var error     = require('./error')
  , File      = require('./file')
  , Directory = require('./directory');

var Link = module.exports = function Link (name, target) {

  if (this instanceof Link) throw error.NOT_A_CONSTRUCTOR('glagol.Link');

  function link () { return link.target() }

  // link's own properties
  Object.defineProperty(link, 'name', { value: name })
  link.target = target;

  // proxied properties;
  // TODO errors if wrong type;
  // TODO or maybe define/undefine properties when setting target?
  Link.PROPERTIES.COMMON.map(installCommonProperty.bind(link))
  Link.PROPERTIES.FILE.map(installTypeProperty.bind(link,
    require('./file')));
  Link.PROPERTIES.DIRECTORY.map(installTypeProperty.bind(link,
    require('./directory')));

  return link;

}

Link.PROPERTIES =
  { COMMON:
    [ '_options', 'options', 'parent', 'events', '_glagol', 'parent', 'path'
    , 'reset', 'get', '_cache' ]
  , FILE:
    [ 'mount', 'source', 'compiled', 'value', 'path', 'format' ]
  , DIRECTORY:
    [ 'nodes', 'add', 'remove', 'overlay', 'root' ] }

function installCommonProperty (name) {
  var self = this;
  Object.defineProperty(this, name,
    { enumerable: true, configurable: true
    , get: function ()  { return self.target[name]     }
    , set: function (v) { return self.target[name] = v } })
}

function installTypeProperty (type, name) {
  var self = this;
  Object.defineProperty(this, name,
    { enumerable: true, configurable: true
    , get: function () {
        if (type.is(self.target)) return self.target[name]
      }
    , set: function (v) {
        if (type.is(self.target)) return self.target[name = v]
      }})
}
