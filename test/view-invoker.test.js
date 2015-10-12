define(
  [ 'Squire'
  , 'sinon'
  ]
  , function(Squire, sinon) {
    describe('View Invoker', function() {

      var viewInvoker
        , logSpy

      beforeEach(function(done) {

        var injector = new Squire()

        injector.mock('logger/log', function() {
          logSpy = {
            debug: sinon.spy()
          }
          return {
            load: function(name, req, onload, config) {
              onload(logSpy)
            }
          }
        })
        .require(
          [ 'view-invoker' ]
        , function(r) {
            viewInvoker = r
            done()
          }
        )
      })

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

      it('should log when the status of the response is not 200', function() {
        var req = {
              context: {}
            }
          , res = {
              statusCode: 404,
              body: sinon.spy()
            }
        viewInvoker(req, res)
        logSpy.debug.should.have.been.calledOnce
      })

      it('should log when the body of the response is not a function', function() {
        var req = {
              context: {}
            }
          , res = {
              statusCode: 200,
              body: 42
            }
        viewInvoker(req, res)
        logSpy.debug.should.have.been.calledOnce
      })
    })
  }
)