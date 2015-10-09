define(function(require) {
  var Squire = require('Squire')
  , d3 = require('d3')
  , findClosest
  , location
  , web
  , locationHash
  , address
  , anchor

  describe('Location', function() {
    beforeEach(function(done) {
      var locationHashDispatcher = d3.dispatch('statechange')
      var navigateDispatcher = d3.dispatch('navigate')

      var injector = new Squire();
      var locationHashApi = {
        state: function(value){
          if (arguments.length) {
            locationHash.value = value
            locationHashDispatcher.statechange()
            return locationHash
          }
          return locationHash.value
        }
      , hrefFromPath: function(path){ return path }
      , pathFromHref: function(href){ return href.split('#')[1] ||'' }
      , shouldIgnoreHref: function(href) { return !~href.indexOf('#') }
      , value: undefined
      }
      findClosest = function(fn, node, baseCase) {
        if (!node) return baseCase
        if (fn(node)) return node
        return findClosest(fn, node.parentNode, baseCase)
      }
      web = {
          uri : function(uri, params) {
            var paramsString = ""
            Object.keys(params).forEach(function(key) {
              paramsString += "/" + params[key]
            })
            return uri.split("/{")[0] + paramsString
          }
        , find: function(v) { return web.routes[v] }
        , routes: {}
      }
      findClosest.anchor = function() {
        return anchor
      }

      locationHash = d3.rebind(locationHashApi, locationHashDispatcher, 'on')

      var addressApi = function address(path) {
        return {
          'origin': function(target) {
            return {navigate: function(path) { navigateDispatcher.navigate(path) }}
          }
        }
      }

      address = d3.rebind(addressApi, navigateDispatcher, 'on')

      injector.mock(
        'web'
      , function() {
        return {
          load: function(name, req, onload, config) {
            onload(web)
          }
        }
      }).mock(
        'location-hash'
      , function() {
        return locationHash
      }).mock(
        'address'
      , function() {
        return address
      }).mock(
        'find-closest'
      , function() {
        return findClosest
      })
      .require(
        [ 'location' ]
      , function(a) {
        location = a
        done()
      }
      )
    })

    it('should get the current state', function () {
      expect(location.getState()).to.be.undefined
    })

    it('should update the current state when the hash changes', function () {
      var handlerCalled = false
      location.on('statechange', function() {
        handlerCalled = true
      })
      locationHash.state('b')
      expect(location.getState()).to.be.equal('b')
      expect(handlerCalled).to.be.true
    })

    it('should not dispatch the state change on push when value does not change', function () {
      var handlerCalled = false
      locationHash.state('a')
      location.on('statechange', function() {
        handlerCalled = true
      })
      expect(location.pushState('a')).to.be.undefined
      expect(location.getState()).to.be.equal('a')
      expect(locationHash.state()).to.be.equal('a')
      expect(handlerCalled).to.be.false
    })

    it('should not dispatch the state change on push when value does change', function () {
      var handlerCalled = false
      location.on('statechange', function() {
        handlerCalled = true
      })
      expect(location.pushState('b')).to.be.true
      expect(location.getState()).to.be.equal('b')
      expect(locationHash.state()).to.be.equal('b')
      expect(handlerCalled).to.be.false
    })
    
    it('should not dispatch the state change on set when value does not change', function () {
      var handlerCalled = false
      locationHash.state('a')
      location.on('statechange', function() {
        handlerCalled = true
      })
      location.setState('a')
      expect(location.getState()).to.be.equal('a')
      expect(locationHash.state()).to.be.equal('a')
      expect(handlerCalled).to.be.false
    })

    it('should dispatch the state change on set when value does change', function () {
      var handlerCalled = false
      locationHash.state('a')
      location.on('statechange', function() {
        handlerCalled = true
      })
      location.setState('b')
      expect(location.getState()).to.be.equal('b')
      expect(locationHash.state()).to.be.equal('b')
      expect(handlerCalled).to.be.true
    })

    it('should try to open a new window', function () {
      var open = window.open
      var opened = false
      window.open = function(path, target) {
        expect(path).to.be.equal('a')
        expect(target).to.be.equal('_blank')
        opened = true;
      }

      expect(opened).to.be.false
      location.openNewWindow('a', '_blank')
      expect(opened).to.be.true
      window.open = open
    })

    it('should only navigate on click on links with hash and without target', function () {
      var hasNavigated = false
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      address.on('navigate', function () {
        hasNavigated = true
      })

      document.dispatchEvent(evt)
      expect(hasNavigated).to.be.false

      anchor = document.createElement('a')
      document.dispatchEvent(evt)
      expect(hasNavigated).to.be.false

      anchor.href = 'a'
      document.dispatchEvent(evt)
      expect(hasNavigated).to.be.false

      anchor.href = '#a'
      document.dispatchEvent(evt)
      expect(hasNavigated).to.be.false

      web.routes.a = {}
      document.dispatchEvent(evt)
      expect(hasNavigated).to.be.true

      hasNavigated = false
      anchor.target = '_blank'
      document.dispatchEvent(evt)
      expect(hasNavigated).to.be.false
    })
  })
}
)
