define(function(require) {

  var _ = require('underscore')
    , d3 = require('d3')
    , zapp = require('./zapp')
    , location = require('./location')

  return function wrapView(req, res) {

    var view
    if (!_.isFunction(res.body)) return

    view = res.body

    res.body = function(node) {
      var uri = getCurrentUri(req, res)

      if(zapp.isRoot(node)) location.pushState(uri)

      if(shouldClearNode(req, res, node)) clearNode(node)

      dispatchEvent(node, 'update', {detail : { from : node.__resource__, to : uri }})

      node.__resource__ = uri
      view(node)
    }
  }

  function getCurrentUri(req, res) {
    return res.headers.location || req.uri
  }

  function findPath(web, uri) {
    var resource
    if (!web || !uri) return undefined
    resource = web.find(uri)
    return resource ?  resource.path : undefined
  }

  function shouldClearNode(req, res, node) {
    var newPath = findPath(req.web, getCurrentUri(req, res))
      , currentPath = findPath(req.web, node.__resource__)
    return newPath !== currentPath
  }

  function clearNode(node) {
    dispatchEvent(node, 'resourcewillchange')
    d3.select(node).html('')
  }

  function dispatchEvent(node, eventName, eventDetail) {
    if (!node.dispatchEvent) return
    node.dispatchEvent(new CustomEvent(eventName, eventDetail))
  }
})
