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
  api.splitAddress = splitAddress

  return rebind(api, dispatcher, 'on')

  function state(value) {
    var realUrlAddress = value || splitAddress(loc_href())
      , hashAddress = location.hash.toString().slice(1)
      , resultAddress
      , isSame

    if (hashAddress.indexOf('/') !== 0) hashAddress = null

    resultAddress = hashAddress || realUrlAddress

    isSame = hashAddress ? hashAddress === value : splitAddress(loc_href()) === value

    if (hashAddress) history.replaceState(null, null, '/app' + resultAddress)

    if (!arguments.length) return pathFromHref('/app' + resultAddress)
    if (!isSame) history.pushState(null, null, '/app' + resultAddress)

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
    return splitAddress(uri.path())
  }

  function splitAddress(uri) {
    return uri.split('/app')[1]
  }

  function shouldIgnoreHref(href) {
    return !~href.indexOf('#')
  }
})
