define(function(require) {
  var findClosest = require('./find-closest')
  var rebind = require('./rebind')
  var dispatcher = require('d3-dispatch').dispatch('statechange')
  var on = require('./on')

  return function () {
    var history = window.history
    var location = window.location
    var base = ''

    on.call(window, 'popstate.location', handleStateChange)
    on.call(document, 'click.location', handleClick)

    if (isHashPath(location.hash)) {
      // Redirect current hash fragment location to "real" path
      history.replaceState(null, null, rebase(fullPath(location)) + location.search)
    }

    var api =
        { getState: getState
        , setState: setState
        , pushState: deprecatedPushState
        , replaceState: replaceState
        , openNewWindow: openNewWindow
        , basePath: basePath
        }

    return rebind(api, dispatcher, 'on')

    function getState() {
      return unbase(fullPath(location))
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

    function trimPath(path) {
      return '/' + trimSlashes(~path.indexOf('#/')? path.split('#/')[1] : path)
    }

    function updateState(path, method) {
      path = unbase(trimPath(path))

      if (path === getState()) {
        return false
      } else {
        method({ base: base, path: path }, null, rebase(path) + location.search)
        return path
      }
    }

    function deprecatedPushState(path) {
      console.warn('deprecated : location.pushState, to be removed in v.4.0.0.')
      return pushState(path)
    }

    function pushState(path) {
      return updateState(path, history.pushState.bind(history))
    }

    function replaceState(path) {
      return updateState(path, history.replaceState.bind(history))
    }

    function openNewWindow(path, target) {
      return window.open(rebase(path), target, '')
    }

    function basePath(path) {
      if (arguments.length === 0) return base

      var cwd = unbase(fullPath(location))

      path = trimSlashes(path)
      base = path? '/' + path : ''

      history.replaceState(null, null, rebase(cwd))
    }

    function handleClick(event) {
      var a
        , target = event.target
        , path

      if (event.ctrlKey) return      // Ignore ctrl+click
      if (event.button !== 0) return // Ignore clicks by buttons other than primary (usually left button)

      a = findClosest.anchor(target)

      if ( !a // non-anchor clicks
        || !!a.target // anchors with specified targets
        || a.hasAttribute('download') // anchors with download attribute
        || !isSameOrigin(a, location) // links to different origins
      ) {
        /* If any of the above conditions are true, we ignore the click and
         * let the browser deal with the navigation as it sees fit
         */
        return
      }

      var path

      if (isHashPath(a.hash)) {
        path = rebase(a.hash.slice(1))
      } else if (a.hash || a.href.slice(location.href.length) === '#') {
        // Ignore links with a non-path hash, and empty hashes (e.g.: `<a href="#"></a>`)
        return
      } else {
        path = rebase(fullPath(a))
      }

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
      var path, base = (event.state && event.state.base) || ''

      if (isHashPath(location.hash)) {
        // "Redirect" current location to a proper path
        path = location.hash.slice(1)

        if (path) {
          var state = { base: base, path: path }
          history.replaceState(state, null, rebase(path))
        }
      } else {
        path = fullPath(location)
      }

      dispatcher.statechange(unbase(path))
    }

    function isHashPath(hash) {
      return (hash || '').slice(0, 2) === '#/'
    }

    function isSameOrigin(a, x) {
      var o = origin(x)
      return a.href.slice(0, o.length) === o
    }

    function origin(url) {
      if (url.origin) {
        return url.origin
      } else {
        var port

        if (url.port && !~url.href.indexOf(':' + url.port)) {
          // IE defaults port values based on protocol, which messes things up
          port = ''
        } else {
          port = ':' + url.port
        }

        return url.protocol + "//" + url.hostname + port
      }
    }

    function fullPath(url) {
      if (isHashPath(url.hash)) {
        return url.hash.slice(1)
      } else {
        return url.href.slice(origin(url).length)
      }
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
      return (path || '').replace(/^\/+|\/+$/g, '')
    }
  }
})
