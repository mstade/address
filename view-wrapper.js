define(function(require) {

  var _ = require('underscore')

  return function creatViewWrapper(location, req, res) {
    if (_.isFunction(res.body)) wrapView(location, req, res)
  }

  function wrapView(location, req, res) {
    var view = res.body
    res.body = function(node) {

      var uri = res.headers.location || req.uri
        , web = req.web
        , newPath = findPath(web, uri)
        , currentPath = findPath(web, node.__resource__)

      if(location.isRoot(node)) location.pushState(uri)
      dispatchEvent(node, 'update', {detail : { from : node.__resource__, to : uri }})

      if (newPath !== currentPath) clearNode(node)

      // look up current and requested resource paths from concrete uri
      // if is not the same resource
      // dispatch resourceWillChange
      // clear the node html
      node.__resource__ = uri
      view(node)
    }
  }

  function dispatchEvent(node, eventName, eventDetail) {
    if (!node.dispatchEvent) return
    node.dispatchEvent(new CustomEvent(eventName, eventDetail))
  }

  function clearNode(node) {
    dispatchEvent(node, 'resourcewillchange')
  }

  function findPath(web, uri) {
    var resource
    if (!web || !uri) return undefined
    resource = web.find(uri)
    return resource ?  resource.path : undefined
  }

})
