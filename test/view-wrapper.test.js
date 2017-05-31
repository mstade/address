define(function(require) {

  var _ = require('underscore')
    , sinon = require('sinon')
    , Squire = require('Squire')
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
        .require(['view-wrapper'], function(viewWrapper) {
          wrapView = viewWrapper
          done()
        })
    })

    after(function() {
      injector.clean(['./z-app'])
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

    it('should dispatch "update" when using a DOMElement for the first time', function() {

      eventName = 'update'
      node.addEventListener(eventName, callback)

      wrapView(location, reqOne, resOne)
      resOne.body(node)

      callback.should.have.been.calledOnce

      expect(callback.firstCall.args[0].detail).to.deep.equal({ from: undefined, to: 'resource/one' })
    })

    it('should dispatch "update" when addressing a different resource on the same DOMElement', function () {

      eventName = 'update'
      node.addEventListener(eventName, callback)

      wrapView(location, reqOne, resOne)
      resOne.body(node)

      wrapView(location, reqTwo, resTwo)
      resTwo.body(node)

      callback.should.have.been.calledTwice

      expect(callback.firstCall.args[0].detail).to.deep.equal({ from: undefined, to: 'resource/one' })
      expect(callback.secondCall.args[0].detail).to.deep.equal({ from: 'resource/one', to: 'resource/two' })
    })

    it('should not dispatch "update" when addressing the same resource on the same DOMElement', function() {

      eventName = 'update'
      node.addEventListener(eventName, callback)

      eventName = 'update'
      node.addEventListener(eventName, callback)

      wrapView(location, reqOne, resOne)
      resOne.body(node)

      wrapView(location, reqOne, resTwo)
      resTwo.body(node)

      callback.should.have.been.calledTwice

      expect(callback.firstCall.args[0].detail).to.deep.equal({ from: undefined, to: 'resource/one' })
      expect(callback.secondCall.args[0].detail).to.deep.equal({ from: 'resource/one', to: 'resource/one' })
    })
  })

  // Because of the lack of documentation, there are uses of address where a set of customisation have been made:
  // + `web.find` is overridden.
  // + metadata properties is stored on the route resource itself, rather than on `resource.metadata`.
  //
  // In a future release we may want to deprecate or remove this behaviour.
  // Further details can be found: https://github.com/zambezi/address/issues/59
  describe('view-wrapper with metadata properties on resource', function() {

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
        .require(['view-wrapper'], function(viewWrapper) {
          wrapView = viewWrapper
          done()
        })
    })

    after(function() {
      injector.clean(['./z-app'])
    })

    beforeEach(function() {
      var web = createWeb(true)
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

    it('should dispatch "update" when using a DOMElement for the first time', function() {

      eventName = 'update'
      node.addEventListener(eventName, callback)

      wrapView(location, reqOne, resOne)
      resOne.body(node)

      callback.should.have.been.calledOnce

      expect(callback.firstCall.args[0].detail).to.deep.equal({ from: undefined, to: 'resource/one' })
    })

    it('should dispatch "update" when addressing a different resource on the same DOMElement', function () {

      eventName = 'update'
      node.addEventListener(eventName, callback)

      wrapView(location, reqOne, resOne)
      resOne.body(node)

      wrapView(location, reqTwo, resTwo)
      resTwo.body(node)

      callback.should.have.been.calledTwice

      expect(callback.firstCall.args[0].detail).to.deep.equal({ from: undefined, to: 'resource/one' })
      expect(callback.secondCall.args[0].detail).to.deep.equal({ from: 'resource/one', to: 'resource/two' })
    })

    it('should not dispatch "update" when addressing the same resource on the same DOMElement', function() {

      eventName = 'update'
      node.addEventListener(eventName, callback)

      eventName = 'update'
      node.addEventListener(eventName, callback)

      wrapView(location, reqOne, resOne)
      resOne.body(node)

      wrapView(location, reqOne, resTwo)
      resTwo.body(node)

      callback.should.have.been.calledTwice

      expect(callback.firstCall.args[0].detail).to.deep.equal({ from: undefined, to: 'resource/one' })
      expect(callback.secondCall.args[0].detail).to.deep.equal({ from: 'resource/one', to: 'resource/one' })
    })
  })

  function createWeb(withoutMetadata) {

    var routes = {}
      , api = { find: find, addResource: addResource }

    return api

    function addResource(concreteUri, uriPattern) {
      if (withoutMetadata) {
        // Because of the lack of documentation, there are uses of address where a set of customisation have been made:
        // + `web.find` is overridden.
        // + metadata properties is stored on the route resource itself, rather than on `resource.metadata`.
        //
        // In a future release we may want to deprecate or remove this behaviour.
        // Further details can be found: https://github.com/zambezi/address/issues/59
        routes[concreteUri] = { path: uriPattern }
      } else {
        routes[concreteUri] = { metadata: { path: uriPattern } }
      }
      return api
    }

    function find(uri) {
      return routes[uri]
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
