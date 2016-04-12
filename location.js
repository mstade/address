define(function(require) {
  var findClosest = require('./find-closest')
    , rebind = require('./rebind')
    , dispatcher = require('d3-dispatch').dispatch('statechange')
    , history = window.history
    , location = window.location
    , on = require('./on')
    , base = ''

  on.call(window, 'popstate.location', handleStateChange)
  on.call(document, 'click.location', handleClick)

  if (~location.hash.indexOf('#/')) {
    // Redirect current hash fragment location to "real" path
    var path = location.hash.slice(1)
    history.replaceState(null, null, rebase(path))
  }

  var api =
      { getState: getState
      , setState: setState
      , pushState: pushState
      , openNewWindow: openNewWindow
      , basePath: basePath
      }

  return rebind(api, dispatcher, 'on')

  function getState() {
    var path = location.href.replace(location.origin, '')

    if (path.slice(0, base.length) === base) {
      return path.slice(base.length)
    } else {
      return path
    }
  }

  function setState(path) {
    var actual = pushState(path)
    
    if (actual) {
      var state = { base: base, path: actual }
      dispatcher.statechange(state)
      return state
    } else {
      return false
    }
  }

  function pushState(path) {
    if (~path.indexOf('#/')) {
      path = '/' + trimSlashes(path.split('#/').slice(1)).join('/')
    }

    if (path === getState()) {
      return false
    } else {
      history.pushState({ base: base, path: path }, null, rebase(path))
      return path
    }
  }

  function openNewWindow(path, target) {
    return window.open(rebase(path), target, '')
  }

  function basePath(path) {
    if (arguments.length === 0) return base
    base = path? '/' + trimSlashes(path) : ''
  }

  function handleClick(event) {
    var a
      , target = event.target
      , path

    if (event.ctrlKey) return      // Ignore ctrl+click
    if (event.button !== 0) return // Ignore clicks by buttons other than primary (usually left button)

    a = findClosest.anchor(target)

    if (!a) return         // Ignore non-anchor clicks
    if (!!a.target) return // Ignore anchors with specified targets

    if (a.origin !== location.origin) return    // Ignore links to different origins
    if (a.hash && !~a.hash.indexOf('#/')) return // Ignore links with a non-path hash

    var path = rebase(a.hash? a.hash.slice(1) : a.href.slice(a.origin.length))
    if (path) {
      event.preventDefault()
      event.stopPropagation()
      var actual = pushState(path)

      if (actual) {
        var state = { base: base, path: actual, target: a }
        dispatcher.statechange(state)
      }
    }
  }

  function handleStateChange(event) {
    var where = location.href.slice(location.origin.length)

    if (~where.indexOf('#/')) {
      // "Redirect" current location to a proper path
      var path = location.hash.slice(1)

      if (path) {
        event.preventDefault()
        event.stopPropagation()
        var state = { base: base, path: path }
        history.replaceState(state, null, rebase(path))
        dispatcher.statechange(state)
      }
    } else if (event.state && event.state.base) {
      where = where.slice(event.state.base.length)
      var state = { base: event.state.base, path: where }
      dispatcher.statechange(state)
    }
  }

  function rebase(path) {
    if (path.slice(0, base.length) === base) {
      // Remove base before adding it back in again
      // This is a boo-boo case
      path = path.slice(base.length)
    }

    return base + '/' + trimSlashes(path)
  }

  function trimSlashes(path) {
    return (path || '').replace(/^\/+/, '').replace(/\/+$/, '')
  }
})