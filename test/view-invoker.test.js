define(function(require) {
  var viewInvoker = require('view-invoker'),
      sinon = require('sinon')

  describe('View Invoker', function() {
    it('should call the responses body with the request\'s context', function() {
      var bodySpy = sinon.spy()
        , req = {
            context: {}
          }
        , res = {
          statusCode: 200,
          body: bodySpy
        }
      viewInvoker(req, res)
      bodySpy.should.have.been.calledOnce
      bodySpy.should.have.been.calledWith(req.context)
    })

    it('should not call the responses body if response is not 200', function() {
      var bodySpy = sinon.spy()
        , req = {
            context: {}
          }
        , res = {
            statusCode: 404,
            body: bodySpy
          }
      viewInvoker(req, res)
      bodySpy.should.not.be.called
    })

    it('should not call the responses body if it is not a function', function() {
      var req = {
            context: {}
          }
        , res = {
            statusCode: 200,
            body: 42
          }
      viewInvoker(req, res)
    })
  })
})
