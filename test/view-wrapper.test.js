define(function(require) {

  var _ = require('underscore')
    , sinon = require('sinon')
    , Squire = require('Squire')
    , location = { pushState: function() {}}
    , body = document.body

  describe('view-wrapper', function() {

    var reqOne
      , reqTwo
      , resOne
      , resTwo
      , node
      , callback
      , eventName
      , wrapView
      , injector = new Squire()

    before(function(done) {
      injector
            .mock('./location', function() {
              return { pushState: function() {}}
            })
        .require(['view-wrapper', 'location'], function(viewWrapper, location) {
          wrapView = viewWrapper
          done()
        })
    })

    after(function() {
      injector.clean(['./location', './z-app'])
    })

    beforeEach(function() {
      var web = createWeb()
            .addResource('resource/one', 'resource/one')
            .addResource('resource/two', 'resource/two')

      reqOne = createRequest(web, 'resource/one')
      reqTwo = createRequest(web, 'resource/two')
      resOne = createResponse()
      resTwo = createResponse()

      node =  document.createElement('div')
      node.className = 'view view-wrapper'
      body.appendChild(node)

      callback = sinon.spy()
    })

    afterEach(function() {
      node.removeEventListener(eventName, callback)
      body.removeChild(node)
      callback = null
    })

    it('should dispatch "resourcewillchange" when using a DOMElement for the first time', function() {

      eventName = 'resourcewillchange'
      node.addEventListener(eventName, callback)

      wrapView(location, reqOne, resOne)
      resOne.body(node)

      callback.should.have.been.calledOnce
    })

    it('should dispatch "resourcewillchange" when addressing a different resource on the same DOMElement', function () {

      eventName = 'resourcewillchange'
      node.addEventListener(eventName, callback)

      wrapView(location, reqOne, resOne)
      resOne.body(node)

      wrapView(location, reqTwo, resTwo)
      resTwo.body(node)

      callback.should.have.been.calledTwice
    })

    it('should not dispatch "resourcewillchange" when addressing the same resource on the same DOMElement', function() {

      eventName = 'resourcewillchange'
      node.addEventListener(eventName, callback)

      eventName = 'resourcewillchange'
      node.addEventListener(eventName, callback)

      wrapView(location, reqOne, resOne)
      resOne.body(node)

      wrapView(location, reqOne, resTwo)
      resTwo.body(node)

      callback.should.have.been.calledOnce
    })
  })

  function createWeb() {

    var resources = {}
      , api = { find: find, addResource: addResource }

    return api

    function addResource(concreteUri, uriPattern) {
      resources[concreteUri] = { path: uriPattern }
      return api
    }

    function find(uri) {
      return resources[uri]
    }
  }

  function createRequest(web, uri) {
    return {
        web: web
      , uri: uri
    }
  }

  function createResponse() {
    return { body: function() {}, headers: {} }
  }

})
