define(
  [ 'd3'
  , 'type/type'
  ]
, function(d3, type) {

    var state = getHash(document.location.href) 
      , ignoreFlag = false
      , dispatcher = d3.dispatch('statechange')
      , root

    d3.select(window).on('hashchange', handleHashChange)

    function location() {}

    location.getState = function() { return currentState() }
    location.pushState = pushState

    location.root = function(value) {
      if(!arguments.length || root) return root
      if(type.isString(value)) value = d3.select(value).node()

      root && root.on('click.am.location', null)

      root = value
      d3.select(root).on("click.am.location", handleClick)

      return location
    }

    return d3.rebind(location, dispatcher, 'on')

    function handleHashChange() {

      if(ignore()) return ignore(false)

      var value = getHash(d3.event.newURL)
      clearRoot()
      pushState(value) && dispatcher.statechange(value)
      ignore(false)
    }

    function handleClick() {
      var event = d3.event
        , target = event.target

      if(!target.href) return
      if(!~target.href.indexOf('#')) return

      event.preventDefault()
      event.stopPropagation()
      var resource = target.href.split('#')[1] || ''
      dispatcher.statechange(resource)
    }

    function pushState(value) {
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

    function clearRoot() {
      root.__resource__ = null
    }
  }
)