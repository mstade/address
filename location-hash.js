define(function(require) {

  var d3 = require('d3')
    , dispatcher = d3.dispatch('statechange')
    , api = {}

  d3.select(window).on('hashchange', dispatcher.statechange)

  api.state = state
  api.urlFromPath = urlFromPath

  return d3.rebind(api, dispatcher, 'on')

  function state(value) {
    if (!arguments.length) return pathFromHref(loc_href())
    document.location.hash = value
    return api
  }

  function urlFromPath(path) {
    var hash = '#' + path
    return /#/.test(loc_href()) ? loc_href().replace(/#.*/, hash) : loc_href() + hash
  }

  function loc_href() {
    return document.location.href
  }
})
