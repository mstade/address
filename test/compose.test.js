define(function(require) {
  var Squire = require('Squire')
  , compose
  , web
  , interpolate

  describe('Compose', function() {
    beforeEach(function(done) {

      var injector = new Squire();

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

      injector.mock(
      'web'
      , function() {
        return {
          load: function(name, req, onload, config) {
            onload(web)
          }
        }
      })
      .require(
      [ 'compose', 'interpolate' ]
      , function(a, i) {
        interpolate = i
        compose = a
        done()
      }
      )
    })

    it('should return the requested resource if no routes are defined', function () {
      compose(web, interpolate, 'a', 'b').should.equal('a')
    })

    it('should return the requested resource if route is defined', function () {
      web.routes.a = {
        name : 'b'
      , path : '/a'
      , methods : {}
      , composes : []
      , redirects : {}
      }
      web.routes.b = {
        name : 'b'
      , path : '/b'
      , methods : {}
      , composes : []
      , redirects : {}
      }
      compose(web, interpolate, 'a', 'b').should.equal('a')
    })
    it('should return the composed resource if route is composable', function () {
      web.routes.a = {
        name : 'b'
      , path : '/a/{id}'
      , methods : {}
      , composes : []
      , redirects : {}
      }
      web.routes.b = {
        name : 'b'
      , path : '/b/{id}'
      , methods : {}
      , composes : ['/a/{id}']
      , params: ['{id}']
      , redirects : {}
      }
      compose(web, interpolate, 'a', 'b').should.equal('/b/{id}')
    })
  })
  }
)
