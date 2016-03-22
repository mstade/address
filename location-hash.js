define(function(require) {

  var on = require('./on')
    , rebind = require('./rebind')
    , dispatch = require('d3-dispatch').dispatch
    , dispatcher = dispatch('statechange')
    , api = {}

  on.call(window, 'hashchange', dispatcher.statechange)

  api.state = state
  api.hrefFromPath = hrefFromPath
  api.pathFromHref = pathFromHref
  api.shouldIgnoreHref = shouldIgnoreHref

  return rebind(api, dispatcher, 'on')

  function state(value) {
    if (!arguments.length) return pathFromHref(loc_href())
    document.location.hash = value
    return api
  }

  function hrefFromPath(path) {
    var hash = '#' + path
    return /#/.test(loc_href()) ? loc_href().replace(/#.*/, hash) : loc_href() + hash
  }

  function loc_href() {
    return document.location.href
  }

  function pathFromHref(href) {
    return href.split('#')[1] ||''
  }

  function shouldIgnoreHref(href) {
    return !~href.indexOf('#')
  }
})
