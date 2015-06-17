define(function(require) {

  var d3 = require('d3')
    , _ = require('underscore')
    , zapp = d3.select('.z-app')
    , root = zapp.empty() ? d3.select('body').node() : zapp.node()
    , api = {}

  api.isRoot = isRoot
  api.root = function() { return root }
  api.clearResource = clearResource
  api.resource = resource
  api.rootResource = rootResource

  return api

  function isRoot(node) {
    return node == root
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

})