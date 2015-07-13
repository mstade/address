define(function(require) {

  var d3 = require('d3')
    , rootClassName = 'z-app'
    , rootSelector = '.' + rootClassName
    , zapp = d3.select(rootSelector)
    , root = zapp.empty() ? d3.select('body').node() : zapp.node()
    , findClosest = require('./find-closest')
    , api = {}

  api.isRoot = isRoot
  api.root = getRoot
  api.clearResource = clearResource
  api.resource = resource
  api.rootResource = rootResource
  api.rootClassName = function() { return rootClassName }

  return api

  function isRoot(node) {
    return root == node
  }

  function clearResource(node) {
    node.__resource__ = null
    return true
  }

  function rootResource() {
    return resource(root)
  }

  function resource(node, value) {
    if (arguments.length != 2) return node.__resource__
    node.__resource__ = value
  }

  function getRoot(origin) {
    if (!origin) return root
    return findLocalRoot(origin)
  }

  function findLocalRoot(origin) {
    return findClosest.bySelector(rootSelector, origin, root)
  }
})


