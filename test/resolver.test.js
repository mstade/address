define(
  [ 'Squire'
  , 'sinon'
  , 'jquery'
  ]
  , function(Squire, sinon, $) {
    describe('Resolver', function() {

      var resolver
      , cbSpy
      , requireStub
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
          [ 'resolver' ]
        , function(r) {
            resolver = r
            cbSpy = sinon.spy()
            requireStub = sinon.stub(window, "require", function(dep, cb) {
              cb(cbSpy)
            })

            done()
          }
        )
      })

      afterEach(function() {
        requireStub.restore()
      })

      it('should return a resolver configured with a require module name', function() {
        var resolve = resolver("require/module")
          , type = typeof resolve
          , req = {}
          , res = sinon.spy()

        type.should.equal('function')
        resolve.length.should.equal(2)

        resolve.call(null, req, res)
        
        requireStub.should.have.been.calledOnce
        requireStub.should.have.been.calledWith(["require/module"])

        cbSpy.should.have.been.calledOnce
        cbSpy.should.have.been.calledWith(req)
      })

      it('should log when no function returned after resolve', function() {
        cbSpy = {}
        var resolve = resolver("require/module")
          , res = sinon.spy()

        resolve.call(null, {}, res)
        logSpy.debug.should.have.been.calledOnce
      })

      it('should return a resolver when called returns a function that calls the response', function() {
        cbSpy = sinon.spy(function(req, fn) {
          var fnSpy = sinon.spy(fn)
            , type = typeof fn
          type.should.equal('function')
          fnSpy()
          fnSpy(null)
        })
        var resolve = resolver("require/module")
          , res = sinon.spy()
          , req = {}

        resolve.call(null, req, res)
        cbSpy.should.have.been.calledOnce
        res.should.have.been.calledTwice
        res.should.have.been.calledWith()
        res.should.have.been.calledWith(null)
      })
    })
  }
)