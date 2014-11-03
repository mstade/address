define(
  [ 'd3'
  , 'underscore'
  , 'type/type'
  , './compose'
  ]
, function(d3, _, type, compose) {

    var state = getHash() 
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

      location.isRoot = function(node) {
        return node == root
      }

      return d3.rebind(location, dispatcher, 'on')
    }

    function handleHashChange() {

      if(ignore()) return ignore(false)

      var value = getHash()
      clearRoot()
      setState(value)
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
      pushState(value) && clearRoot() && dispatcher.statechange(value)
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
      return true
    }

    function openNewWindow(path, target) {
      var hash = "#" + path
        , href = document.location.href
        , url = /#/.test(href) ? href.replace(/#.*/, hash) : href + hash
      window.open(url, target, '')
    }

    function handleClick() {
      var anchor
        , event = d3.event
        , target = event.target

      if(event.ctrlKey) return
      if(event.button == 1) return
      anchor = findClosestAnchor(target)
      if(!anchor) return
      if(!!anchor.target) return
      if(!~anchor.href.indexOf('#')) return

      var path = anchor.href.split('#')[1] || ''

      if(!path) return
      if(!web.find(path)) return

      event.preventDefault()
      event.stopPropagation()

      setState(compose(web, path, resource(root)))
    }

    function findClosestAnchor(node) {
      if (!node) return null
      if (node.nodeName == 'A' && node.href) return node
      return findClosestAnchor(node.parentElement)
    }

    function getHash() {
      return (document.location.href.split('#')[1] || '')
    }

    function setHash(value) {
      document.location.hash = value
    }
  }
)