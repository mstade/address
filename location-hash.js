define(function(require) {

  var on = require('./on')
    , rebind = require('./rebind')
    , dispatch = require('d3-dispatch').dispatch
    , dispatcher = dispatch('statechange')
    , api = {}
    , parseUri = require('lil-uri')

  on.call(window, 'hashchange.location-hash', dispatcher.statechange)

  api.state = state
  api.hrefFromPath = hrefFromPath
  api.pathFromHref = pathFromHref
  api.shouldIgnoreHref = shouldIgnoreHref

  return rebind(api, dispatcher, 'on')

  function state(value) {
    if (!arguments.length) return pathFromHref(loc_href())
    // document.location.hash = value
    console.debug('set state (in address)', value)
    history.pushState(null, null, '/app' + value)
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
    var uri = parseUri(href)
    return uri.path().split('/app')[1]

    return href.split('#')[0] ||''
  }

  function shouldIgnoreHref(href) {
    return !~href.indexOf('#')
  }
})
