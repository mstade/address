define(function(require) {
  var Squire = require('Squire')
    , a = require('address')
    , _ = require('underscore')
    , nap = require('@websdk/nap')
    , rhumb = require('@websdk/rhumb')
    , z = require('z-app')
    , web
    , address

  describe('Integration with @websdk/nap', function() {
    beforeEach(function() {
      web = nap.web()

      address = function(r) {
        return a(r).web(web)
      }
    })

    it('should navigate to the url', function () {
      web.resource('a', '/news-reader/articles/{articleId}', _.noop, {
        path: '/news-reader/articles/{articleId}'
      , methods: []
      , composes: []
      , redirects: {}
      })

      address('/news-reader/articles/{articleId}')
        .param('articleId', 1)
        .navigate()
          .should.equal('/news-reader/articles/1')
    })

    it('should navigate to redirect path when navigating to composed path', function () {
      web.resource('a', '/news-reader/articles/{articleId}', _.noop, {
        path: '/news-reader/articles/{articleId}'
      , methods: []
      , composes: []
      , redirects: {}
      })

      web.resource('b', '/news-reader/{articleId}', _.noop, {
        path: '/news-reader/{articleId}'
      , methods: []
      , composes: ['/news-reader/articles/{articleId}']
      , redirects: {
          '/news-reader/articles/{articleId}': '/news-reader/{articleId}'
        }
      })

      var uri = address('/news-reader/{articleId}')
          .param('articleId', 2)
          .navigate()

      uri.should.equal('/news-reader/2')

      z.resource(z.root(), uri)

      address('/news-reader/articles/{articleId}')
        .param('articleId', 1)
        .navigate()
          .should.equal('/news-reader/1')
    })
  })

  // Because of the lack of documentation, there are uses of address where a set of customisation have been made:
  // + `web.find` is overridden.
  // + metadata properties is stored on the route resource itself, rather than on `resource.metadata`.
  //
  // In a future release we may want to deprecate or remove this behaviour.
  // Further details can be found: https://github.com/zambezi/address/issues/59
  describe('Integration with customised @websdk/nap', function() {
    beforeEach(function() {
      web = nap.web()
      _.extend(web, {
        find: function(v) {
          return web.routes.match(v)
        }
      , routes: rhumb.create()
      , add: function(resource) {
          web.routes.add(resource.path, function(params){

            var methods = _.isObject(resource.methods) ? Object.keys(resource.methods) : null

            return {
              name : resource.name
            , path : resource.path
            , methods : methods
            , params : params
            , composes : resource.composes || []
            , redirects : resource.redirects || {}
            }
          })

        }
      })

      address = function(r) {
        return a(r).web(web)
      }
    })

    it('should navigate to the url', function () {
      web.add({
          "name": "a"
        , "path": "/news-reader/articles/{articleId}"
        , "methods": {}
        , composes : []
        , params: {}
        , redirects : {}
      })
      address('/news-reader/articles/{articleId}')
        .param('articleId', 9)
        .navigate()
          .should.equal('/news-reader/articles/9')
    })

    it('should navigate to redirect path when navigating to composed path', function () {
      web.add({
        "name": "a"
      , "path": "/news-reader/articles/{articleId}"
      , "methods": {}
      , composes : []
      , params: {}
      , redirects : {}
      })
      web.add({
        "name": "b"
      , "path": "/news-reader/{articleId}"
      , "methods": {}
      , "composes" : [ "/news-reader/articles/{articleId}" ]
      , params: {}
      , redirects : {'/news-reader/articles/{articleId}': '/news-reader/{articleId}'}
      })
      var uri = address('/news-reader/{articleId}')
          .param('articleId', 2)
          .navigate()

      uri.should.equal('/news-reader/2')

      z.resource(z.root(), uri)

      address('/news-reader/articles/{articleId}')
        .param('articleId', 5)
        .navigate()
        .should.equal('/news-reader/5')
    })
  })
})
