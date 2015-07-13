define(function(require) {

    var d3 = require('d3')
      , web = require('./web!')
      , location = require('./location-hash')
      , findClosest = require('./find-closest')

      , state = location.state()
      , dispatcher = d3.dispatch('statechange')
      , ignoreFlag = false

      , api = {}

    location.on('statechange', handleStateChange)
    d3.select(document).on('click', handleClick)

    api.getState = function() { return currentState() }
    api.setState = setState
    api.pushState = pushState
    api.openNewWindow = openNewWindow

    return d3.rebind(api, dispatcher, 'on')

    function handleStateChange() {
      if(ignore()) return ignore(false)
      setState(location.state())
      ignore(false)
    }

    function pushState(value) {
      if(isCurrentState(value)) return
      ignore(true)
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

    function ignore(value) {
      if(!arguments.length) return ignoreFlag
      ignoreFlag = value
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
  }
)
