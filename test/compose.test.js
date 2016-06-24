define(function(require) {
  var Squire = require('Squire')
    , compose
    , web
    , _ = require('underscore')

  describe('Compose', function() {
    beforeEach(function(done) {

      var injector = new Squire();

      web = {
        uri : function(uri, params) {
          return _.template(uri, {interpolate: /\{(.+?)\}/g })(params)
        }
        , find: function(v) { return web.routes[v] }
        , routes: {}
      }

      injector.require(
        [ 'compose' ]
      , function(a) {
        compose = a
        done()
      }
      )
    })

    it('should return the requested resource if no routes are defined', function () {
      compose(web, 'a', 'b').should.equal('a')
    })

    it('should return the requested resource if route is defined', function () {
      web.routes.a = {
        name : 'a'
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
      compose(web, 'a', 'b').should.equal('a')
    })
    it('should return the composed resource if route is composable', function () {
      web.routes.a = {
        name : 'a'
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
      , params: { id: 'foo' }
      , redirects : {}
      }
      compose(web, 'a', 'b').should.equal('/b/foo')
    })
    it('should return the composed resource if route is composable with optional parameters', function () {
      web.routes['/news-reader/articles/2'] = {
        "name": "a"
      , "path": "/news-reader/articles/{articleId}"
      , "methods": {}
      , composes : []
      , params: {articleId: 2}
      , redirects : {}
      }
      web.routes['/news-reader/1'] = {
        "name": "b"
      , "path": "/news-reader(/{articleId})"
      , "methods": {}
      , "composes" : [ "/news-reader/articles/{articleId}" ]
      , params: {articleId: 1}
      , redirects : {}
      }
      compose(web, '/news-reader/articles/2', '/news-reader/1').should.equal('/news-reader(/2)')
    })
  })
  }
)
