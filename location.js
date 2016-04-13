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
    return unbase(path)
  }

  function setState(path) {
    var actual = pushState(path)
    
    if (actual) {
      dispatcher.statechange(actual)
      return actual
    } else {
      return false
    }
  }

  function pushState(path) {
    if (~path.indexOf('#/')) {
      path = '/' + trimSlashes(path.split('#/').slice(1)).join('/')
    }

    path = unbase(path)

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

    var cwd = location.href.slice(location.origin.length)
    history.replaceState(null, null, rebase(cwd))
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
        dispatcher.statechange(actual)
      }
    }
  }

  function handleStateChange(event) {
    var path = location.href.slice(location.origin.length)
      , base = (event.state && event.state.base) || ''

    if (~path.indexOf('#/')) {
      // "Redirect" current location to a proper path
      var path = location.hash.slice(1)

      if (path) {
        var state = { base: base, path: path }
        history.replaceState(state, null, rebase(path))
      }
    }

    dispatcher.statechange(unbase(path))
  }

  function rebase(path) {
    return base + '/' + trimSlashes(unbase(path))
  }

  function unbase(path) {
    if (path.slice(0, base.length) === base) {
      return path.slice(base.length)
    } else {
      return path
    }
  }

  function trimSlashes(path) {
    return (path || '').replace(/^\/+/, '').replace(/\/+$/, '')
  }
})