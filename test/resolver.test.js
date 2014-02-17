define(
  [ 'Squire'
  , 'sinon'
  , 'jquery'
  ]
  , function(Squire, sinon, $) {

    var resolver
      , cbSpy
      , requireStub

    beforeEach(function(done) {

      var injector = new Squire()

      injector.require(
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

    describe('Resolver', function() {

      it('should return a resolver configured with a require module name', function() {

        var resolve = resolver.resolve("require/module")
          , type = typeof resolve
          , req = {}
          , res = {}
          , scope = {}

        type.should.equal('function')
        resolve.length.should.equal(2)

        resolve.call(scope, req, res)
        
        requireStub.should.have.been.calledOnce
        requireStub.should.have.been.calledWith(["require/module"])

        cbSpy.should.have.been.calledOnce
        cbSpy.should.have.been.calledWith(req, res)
        cbSpy.should.have.been.calledOn(scope)
      })

      it('should return a view resolver configured with a require module name', function() {

        var resolve = resolver.resolveView("require/module")
          , type = typeof resolve
          , res = {}
          , scope = {}

        type.should.equal('function')
        resolve.length.should.equal(1)

        resolve.call(scope, res)
        
        requireStub.should.have.been.calledOnce
        requireStub.should.have.been.calledWith(["require/module"])

        cbSpy.should.have.been.calledOnce
        cbSpy.should.have.been.calledWith(res)
        cbSpy.should.have.been.calledOn(scope)
      })
    })
  }
)