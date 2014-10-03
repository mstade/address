define(
  [ 'd3'
  ]
, function(d3) {

    var state = getHash(document.location.href) 
      , ignoreFlag = false
      , dispatcher = d3.dispatch('statechange')

    d3.select(window).on('hashchange', handleHashChange)

    function location() {}

    location.getState = function() { return currentState() }
    location.pushState = pushState

    return d3.rebind(location, dispatcher, 'on')

    function handleHashChange() {

      if(ignore()) return ignore(false)

      var value = getHash(d3.event.newURL)
      pushState(value) && dispatcher.statechange(value)
      ignore(false)
    }

    function pushState(value) {
      console.log("pushState: ", value, currentState())
      if(isCurrentState(value)) return

      ignore(true)
      currentState(value)
      setHash(value)
      return true
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

    function getHash(value) {
      return (value.split('#')[1] || '')
    }

    function setHash(value) {
      document.location.hash = value
    }
  }
)