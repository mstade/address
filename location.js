define(function(require) {

    var d3 = require('d3')
      , compose = require('./compose')
      , web = require('./web!')
      , zapp = require('./z-app')
      , location = require('./location-hash')

      , state = location.state()
      , dispatcher = d3.dispatch('statechange')
      , ignoreFlag = false

      , api = {}

    d3.select(window).on('hashchange', handleHashChange)
    d3.select(document).on('click', handleClick)

    api.getState = function() { return currentState() }
    api.setState = setState
    api.pushState = pushState
    api.openNewWindow = openNewWindow

    return d3.rebind(api, dispatcher, 'on')

    function handleHashChange() {
      if(ignore()) return ignore(false)
      zapp.clearRoot()
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
      pushState(value) &&
      // Probably this is not needed anymore due to AMPLAT-911
      // https://jira-2.dts.fm.rbsgrp.net/browse/AMPLAT-911
      zapp.clearRoot() &&
      dispatcher.statechange(value)
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
      window.open(location.urlFromPath(path), target, '')
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

      setState(compose(web, path, zapp.rootResource()))
    }

    function findClosestAnchor(node) {
      if (!node) return null
      if (node.nodeName == 'A' && node.href) return node
      return findClosestAnchor(node.parentElement)
    }

  }
)
