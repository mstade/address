define(function(require) {

  var d3 = require('d3')
    , dispatcher = d3.dispatch('statechange')
    , hash = {}

  d3.select(window).on('hashchange', dispatcher.statechange)

  hash.state = state
  hash.urlFromPath = urlFromPath

  return d3.rebind(hash, dispatcher, 'on')

  function state(value) {
    if (!arguments.length) return getHash()
    document.location.hash = value
    return hash
  }

  function getHash() {
    return href().split('#')[1] || ''
  }

  function urlFromPath(path) {
    var hash = '#' + path
    return /#/.test(href()) ? href().replace(/#.*/, hash) : href() + hash
  }

  function href() {
    return document.location.href
  }
})
