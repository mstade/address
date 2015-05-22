define(function(require) {

  var _ = require('underscore')
    , $ = require('jquery')
    , sinon = require('sinon')
    , location = { headers: {}, isRoot: function() { return false } }
    , createViewWrapper = require('view-wrapper')
    , body = $('body')

  describe('view-wrapper', function() {

    it('should always dispatch an "update" event', function() {
      var web = createWeb().addResource('foo/bar', 'foo/{bar}')
        , req = (web, 'foo/bar')
        , res = createResponse()
        , node = createNode()
        , spy = sinon.spy()

      node.addEventListener('update', spy)
      createViewWrapper(location, req, res)
      res.body(node)

      spy.should.have.been.calledOnce
    })

    xit('should dispatch a "resourceWillChange" event when using a DOMElement for the first time', function() {
      expect(false).to.be.ok
    })

    xit('should dispatch a "resourceWillChange" event when addressing a different resource on the same DOMElement', function () {
      expect(false).to.be.ok
    })

    xit('should not dispatch a "resourceWillChange" event when addressing the same resource on the same DOMElement', function() {
      expect(false).to.be.ok
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

  function createNode() {
    var node = $('<div class="view"></div>')[0]
    body.append(node)
    return node
  }

})
