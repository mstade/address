define(function(require) {

  var d3 = require('d3')
    , _ = require('underscore')
    , zapp = d3.select('.z-app')
    , root = zapp.empty() ? d3.select('body').node() : zapp.node()
    , resource = _.property('__resource__')

  return {
      isRoot: isRoot
    , root: function() { return root }
    , clearRoot: clearRoot
    , resource: resource
    , rootResource: rootResource
  }

  function isRoot(node) {
    return node == root
  }

  function clearResource(node) {
    node.__resource__ = null
    return true
  }

  function clearRoot() {
    return clearResource(root)
  }

  function rootResource() {
    return resource(root)
  }

})
