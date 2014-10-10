define(
  [ 'd3'
  , 'underscore'
  , 'type/type'
  , './compose'
  ]
, function(d3, _, type, compose) {

    var state = getHash(document.location.href) 
      , resource = _.property('__resource__')
      , dispatcher = d3.dispatch('statechange')
      , ignoreFlag = false
      , root
      , web

    d3.select(window).on('hashchange', handleHashChange)
    d3.select(document).on('click', handleClick)

    return function(r, w) {

      root = root || r 
      web = web || w 
    
      function location() {}

      location.getState = function() { return currentState() }
      location.setState = setState
      location.pushState = pushState
      location.openNewWindow = openNewWindow

      location.root = function() {
        return root
      }

      return d3.rebind(location, dispatcher, 'on')
    }

    function handleHashChange() {

      if(ignore()) return ignore(false)

      var value = getHash(d3.event.newURL)
      clearRoot()
      pushState(value) && dispatcher.statechange(value)
      ignore(false)
    }

    function pushState(value) {
      if(isCurrentState(value)) return
      ignore(true)
      currentState(value)
      setHash(value)
      return true
    }

    function setState(value) {
      clearRoot()
      pushState(value) && dispatcher.statechange(value)
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

    function clearRoot() {
      root.__resource__ = null
    }

    function openNewWindow(path, target) {
      var hash = "#" + path
        , href = document.location.href
        , url = /#/.test(href) ? href.replace(/#.*/, hash) : href + hash
      window.open(url, target, '')
    }

    function handleClick() {
      var event = d3.event
        , target = event.target

      if(!target.href) return
      if(!~target.href.indexOf('#')) return

      var path = target.href.split('#')[1] || ''

      if(!path) return
      if(!web.find(path)) return

      event.preventDefault()
      event.stopPropagation()

      setState(compose(web, path, resource(root)))
    }

    function getHash(value) {
      return (value.split('#')[1] || '')
    }

    function setHash(value) {
      document.location.hash = value
    }
  }
)