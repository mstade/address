define(
  [ 'Squire'
  , 'sinon'
  ]
  , function(Squire, sinon) {
    describe('Find Closest', function() {

      var findClosest
        , logSpy
        , querySelectAll
        , queryResponse

      beforeEach(function(done) {

        var injector = new Squire()

        injector.require(
          [ 'find-closest' ]
        , function(r) {
            findClosest = r
            done()
          }
        )
        querySelectAll = sinon.stub(document, 'querySelectorAll', function () { return queryResponse  })
      })

      afterEach(function() {
        querySelectAll.restore()
      })

      it('should not call the iterator if there is no node', function() {
        var iterator = sinon.spy()
          , baseCase = {}
        findClosest(iterator, null, baseCase).should.equal(baseCase)
        iterator.should.have.not.been.called
      })

      it('should call the iterator if there is a node', function() {
        var iterator = sinon.spy()
          , node = {}
          , baseCase = {}
        findClosest(iterator, node, baseCase).should.equal(baseCase)
        iterator.should.have.been.calledOnce
      })

      it('should return the node if iterator returns true', function() {
        var iterator = sinon.spy(function (v) { return v })
          , node = {}
          , baseCase = {}
        findClosest(iterator, node, baseCase).should.equal(node)
        iterator.should.have.been.calledOnce
      })

      it('should call the iterator on the parent', function() {
        var iterator = sinon.spy()
          , node = {parentNode: {parentNode: {}}}
          , baseCase = {}
        findClosest(iterator, node, baseCase).should.equal(baseCase)

        iterator.should.have.been.calledThrice
        iterator.should.have.been.calledWith(node)
        iterator.should.have.been.calledWith(node.parentNode)
        iterator.should.have.been.calledWith(node.parentNode.parentNode)
      })

      it('should call find the anchor', function() {
        var node = {parentNode: {nodeName: 'A', href: '/a', parenNode: {}}}
          , baseCase = {}
        findClosest.anchor(node, baseCase).should.equal(node.parentNode)
      })

      it('should call the iterator on the parent', function() {
        var node = {parentNode: {nodeName: 'A', href: '/a', parenNode: {}}}
          , baseCase = {}
        findClosest.bySelector('select', node, baseCase).should.equal(baseCase)
        queryResponse = [baseCase, node.parentNode]
        findClosest.bySelector('select', node, baseCase).should.equal(node.parentNode)
      })
    })
  }
)