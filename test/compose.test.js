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

      injector.require(['compose'], function(a) {
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
        fn: _.noop
      , params: {}
      , metadata: {
          path: '/a'
        , methods: []
        , composes: []
        , redirects: {}
        }
      }
      web.routes.b = {
        fn: _.noop
      , params: {}
      , metadata: {
          path: '/b'
        , methods: []
        , composes: []
        , redirects: {}
        }
      }
      compose(web, 'a', 'b').should.equal('a')
    })

    it('should return the composed resource if route is composable', function () {
      web.routes.a = {
        fn: _.noop
      , params: {}
      , metadata: {
          path: '/a/{id}'
        , methods: []
        , composes: []
        , redirects: {}
        }
      }
      web.routes.b = {
        fn: _.noop
      , params: {
          id: 'foo'
        }
      , metadata: {
          path: '/b/{id}'
        , methods: []
        , composes: ['/a/{id}']
        , redirects: {}
        }
      }
      compose(web, 'a', 'b').should.equal('/b/foo')
    })

    it('should return the composed resource if route is composable with optional parameters', function () {
      web.routes['/news-reader/articles/2'] = {
        fn: _.noop
      , params: {
          articleId: 2
        }
      , metadata: {
          path: '/news-reader/articles/{articleId}'
        , methods: []
        , composes: ['/a/{id}']
        , redirects: {}
        }
      }
      web.routes['/news-reader/1'] = {
        fn: _.noop
      , params: {
          articleId: 1
        }
      , metadata: {
          path: '/news-reader(/{articleId})'
        , methods: []
        , composes: ['/news-reader/articles/{articleId}']
        , redirects: {}
        }
      }
      compose(web, '/news-reader/articles/2', '/news-reader/1').should.equal('/news-reader(/2)')
    })
  })

  // Because of the lack of documentation, there are uses of address where a set of customisation have been made:
  // + `web.find` is overridden.
  // + metadata properties is stored on the route resource itself, rather than on `resource.metadata`.
  //
  // In a future release we may want to deprecate or remove this behaviour.
  // Further details can be found: https://github.com/zambezi/address/issues/59
  describe('Compose with metadata properties on resource', function() {
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
