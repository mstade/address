define(
  [ 'Squire'
  , 'sinon'
  , 'jquery'
  ]
  , function(Squire, sinon, $) {

    var parser
      , web
      , nap

    beforeEach(function(done) {

      var injector = new Squire();

      nap = { 
        negotiate : {
          method : sinon.spy()
        , accept : sinon.spy()
        , selector : sinon.spy()
        }
      }

      injector.mock(
        'nap'
      , function() {
        return nap
      })
      .require(
        [ 'parser' ]
      , function(p) {
          parser = p
          done()
        }
      )
    })

    describe('Parser', function() {

      it('should parse a single resource with a simple function', function() {
        var config = '[{ "name" : "shell", "path" : "/shell(/{publisher})(/{app})", "methods" : { "get" : "shell-application/shell-application" }}]'
          , resources = parser(config)

        resources.length.should.equal(1)
        nap.negotiate.method.should.have.been.calledOnce
      })

      it('should parse a list of resources', function() {
        var config = '[{"name":"shell","path":"/shell(/{publisher})(/{app})","methods":{"get":"shell-application/shell-application"}},{"name":"app-explorer","path":"/app/explorer","methods":{"get":"app-explorer/app-explorer"}},{"name":"ex2","path":"/logical/path","methods":{"get":"app-explorer/app-explorer"}}]'
         , resources = parser(config)

        resources.length.should.equal(3)
        nap.negotiate.method.should.have.been.calledThrice
      })

      it('should parse a resource with multiple methods')
      it('should parse a resource with accept types')
      it('should parse a resource with selectors')
    })
  }
)