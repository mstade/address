define(function(require) {

  var _ = require('underscore')
    , $ = require('jquery')
    , sinon = require('sinon')
    , location = { headers: {}, isRoot: function() { return false } }
    , createViewWrapper = require('view-wrapper')
    , body = $('body')

  describe('view-wrapper', function() {

    var reqOne
      , reqTwo
      , res1
      , res2
      , node
      , callback
      , eventName

    beforeEach(function() {
      var web = createWeb()
            .addResource('resource/one', 'resource/one')
            .addResource('resource/two', 'resource/two')

      reqOne = createRequest(web, 'resource/one')
      reqTwo = createRequest(web, 'resource/two')
      res1 = createResponse()
      res2 = createResponse()
      node =  $('<div class="view view-wrapper"></div>')[0]
      body.append(node)
      callback = sinon.spy()
    })

    afterEach(function() {
      node.removeEventListener(eventName, callback)
      body.find('.view.view-wrapper').remove()
      callback = null
    })

    xit('should always dispatch an "update" event', function() {
      eventName = 'update'
      node.addEventListener(eventName, callback)
      createViewWrapper(location, reqOne, res1)
      res1.body(node)
      callback.should.have.been.calledOnce
    })

    xit('should dispatch a "resourcewillchange" event when using a DOMElement for the first time', function() {
      eventName = 'resourcewillchange'
      node.addEventListener(eventName, callback)
      createViewWrapper(location, reqOne, res1)
      res1.body(node)
      callback.should.have.been.calledOnce
    })

    it('should dispatch a "resourcewillchange" event when addressing a different resource on the same DOMElement', function () {

      eventName = 'resourcewillchange'
      node.addEventListener(eventName, callback)

      createViewWrapper(location, reqOne, res1)
      res1.body(node)

      createViewWrapper(location, reqTwo, res2)
      res2.body(node)

      callback.should.have.been.calledTwice
    })

    it('should not dispatch a "resourcewillchange" event when addressing the same resource on the same DOMElement', function() {
      eventName = 'resourcewillchange'
      node.addEventListener(eventName, callback)

      eventName = 'resourcewillchange'
      node.addEventListener(eventName, callback)

      createViewWrapper(location, reqOne, res1)
      res1.body(node)

      createViewWrapper(location, reqOne, res2)
      res2.body(node)

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
