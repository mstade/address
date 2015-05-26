define(function(require) {

  var _ = require('underscore')
    , d3 = require('d3')

  return function creatViewWrapper(location, req, res) {
    var view
    if (!_.isFunction(res.body)) return

    view = res.body

    res.body = function(node) {
      var uri = res.headers.location || req.uri
        , web = req.web
        , newPath = findPath(web, uri)
        , currentPath = findPath(web, node.__resource__)

      if(location.isRoot(node)) location.pushState(uri)
      dispatchEvent(node, 'update', {detail : { from : node.__resource__, to : uri }})

      if (newPath !== currentPath) clearNode(node)

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
    d3.select(node).html('')
  }

  function findPath(web, uri) {
    var resource
    if (!web || !uri) return undefined
    resource = web.find(uri)
    return resource ?  resource.path : undefined
  }

})
