define(function(require) {
  var location = require('./location-hash')
    , state = location.state()
    , findClosest = require('./find-closest')
    , rebind = require('./rebind')
    , dispatch = require('d3-dispatch').dispatch
    , dispatcher = dispatch('statechange')
    , on = require('./on')
    , ignoreFlag = false

  location.on('statechange.location', handleStateChange)

  function handleStateChange() {
    var where = location.splitAddress(window.location.pathname + window.location.search + window.location.hash)
    dispatcher.statechange(where)
  }

  function ignore(value) {
    if(!arguments.length) return ignoreFlag
    ignoreFlag = value
  }

  function pushState(value) {
    if(isCurrentState(value)) return
    currentState(value)
    location.state(value)
    return true
  }

  function setState(value) {
    var pushed = pushState(value)
    if (pushed) dispatcher.statechange(value)
  }

  function currentState(value) {
    if(!arguments.length) return state
    state = value
  }

  function isCurrentState(value) {
    return value == currentState()
  }

  function openNewWindow(path, target) {
    window.open(location.hrefFromPath(path), target, '')
  }

  function handleClick() {
    var anchor
      , event = d3.event
      , target = event.target
      , path

    if (event.ctrlKey) return
    if (event.button == 1) return
    anchor = findClosest.anchor(target)
    if (!anchor) return
    if (!!anchor.target) return
    if (location.shouldIgnoreHref(anchor.href)) return

    path = location.pathFromHref(anchor.href)

    if (!path) return
    if (!web.find(path)) return

    event.preventDefault()
    event.stopPropagation()

    // see http://requirejs.org/docs/api.html#circular
    require('./address')(path).origin(target).navigate()
  }

  return function createComponent(web, address) {
    var api = {}

    on.call(window, 'popstate.location-debug', console.debug.bind(console, 'popstate'))
    on.call(window, 'popstate.location', handleStateChange)
    on.call(document, 'click.location', handleClick)

    api.getState = function() { return currentState() }
    api.setState = setState
    api.pushState = pushState
    api.openNewWindow = openNewWindow

    return rebind(api, dispatcher, 'on')
  }
})