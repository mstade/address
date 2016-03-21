define(function(require) {

  var _ = require('underscore')
    , d3 = require('d3')
    , zapp = require('./z-app')

  return function wrapView(location, req, res) {

    var view
    if (!_.isFunction(res.body)) return

    view = res.body

    res.body = function(node) {
      var uri = getCurrentUri(req, res)

      if(zapp.isRoot(node)) location.pushState(uri)
      if(resourceWillChange(req, res, node)) dispatchEvent(node, 'resourcewillchange')
      dispatchEvent(node, 'update', {detail : { from : zapp.resource(node), to : uri }})
      zapp.resource(node, uri)
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

  function resourceWillChange(req, res, node) {
    var newPath = findPath(req.web, getCurrentUri(req, res))
      , currentPath = findPath(req.web, zapp.resource(node))
    return newPath !== currentPath
  }

  function dispatchEvent(node, eventName, eventDetail) {
    if (!node.dispatchEvent) return
    node.dispatchEvent(new CustomEvent(eventName, eventDetail))
  }
})
