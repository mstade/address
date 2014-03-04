define(
  [ 'Squire'
  , 'sinon'
  , 'jquery'
  ]
  , function(Squire, sinon, $) {

    var parser
      , nap
      , resolver

    beforeEach(function(done) {

      var injector = new Squire();

      nap = { 
        is : sinon.spy()
      , negotiate : {
          method : sinon.spy()
        , accept : sinon.spy()
        , selector : sinon.spy()
        }
      , responses : {
          ok : sinon.spy()
        }
      }

      resolver = sinon.stub().returns(function(req, res){})

      injector.mock(
        'nap'
      , function() {
        return nap
      })
      .mock(
        'resolver'
      , function() {
        return resolver
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

      it('should parse methods', function() {
        var config = {
              get  : "app-explorer/app-explorer"
            , send : "app-explorer/app-explorer"
            }
          , methods = parser.parseMethods(config)

        nap.negotiate.method.should.have.been.calledOnce
        nap.negotiate.accept.should.not.have.been.called
        nap.negotiate.selector.should.not.have.been.called

        resolver.should.have.been.calledTwice
      })

      it('should parse media types', function() {
        var config = {
            "application/x.nap.view" : "app-explorer/app-explorer"
          , "application/json" : "app-explorer/app-explorer"
          }
          , mediaTypes = parser.parseMediaTypes(config)

        nap.negotiate.accept.should.have.been.calledOnce
        nap.negotiate.method.should.not.have.been.called
        nap.negotiate.selector.should.not.have.been.called

        resolver.should.have.been.calledTwice
      })

      it('should parse view selectors', function() {
        var config = [
            { ".big" : "shell-application/shell-application"
            , ".small" : "shell-application/shell-application"
            }
          ]
        , negotiateSelector = parser.parseSelectors(config)
        , type = typeof negotiateSelector
        , cbSpy = sinon.spy()

        type.should.equal('function')
        negotiateSelector.length.should.equal(2)

        negotiateSelector(null, cbSpy)
        cbSpy.should.have.been.calledOnce

        resolver.should.have.been.calledTwice
      })

        it('should parse a single resource with a simple function', function() {
        var config = '[{ "name" : "shell", "path" : "/shell(/{publisher})(/{app})", "methods" : "shell-application/shell-application"}]'
          , resources = parser.parseResources(config)

        resources.length.should.equal(1)
        nap.negotiate.method.should.not.have.been.called
      })

      it('should parse a single resource with a get method and simple function', function() {
        var config = '[{ "name" : "shell", "path" : "/shell(/{publisher})(/{app})", "methods" : { "get" : "shell-application/shell-application" }}]'
          , resources = parser.parseResources(config)

        resources.length.should.equal(1)
        nap.negotiate.method.should.have.been.calledOnce
      })

      it('should parse a list of resources', function() {
        var config = '[{"name":"shell","path":"/shell(/{publisher})(/{app})","methods":{"get":"shell-application/shell-application"}},{"name":"app-explorer","path":"/app/explorer","methods":{"get":"app-explorer/app-explorer"}},{"name":"ex2","path":"/logical/path","methods":{"get":"app-explorer/app-explorer"}}]'
          , resources = parser.parseResources(config)

        resources.length.should.equal(3)
        nap.negotiate.method.should.have.been.calledThrice
      })

      it('should parse a resource with multiple methods', function() {
        var config = '[{"name":"shell","path":"/shell(/{publisher})(/{app})","methods":{"get":"shell-application/shell-application","send":"shell-application/shell-application"}}]'
          , resources = parser.parseResources(config)

        resources.length.should.equal(1)
        nap.negotiate.method.should.have.been.calledOnce

        var get = (typeof nap.negotiate.method.args[0][0].get)
          , send = (typeof nap.negotiate.method.args[0][0].send)

        get.should.equal('function')
        send.should.equal('function')
      })

      it('should parse a resource with accept types', function() {
        var config = '[{"name":"shell","path":"/shell(/{publisher})(/{app})","methods":{"get":{"application/x.nap.view":"shell-application/shell-application","application/json":"shell-application/shell-application"}}}]'
          , resources = parser.parseResources(config)

        resources.length.should.equal(1)

        nap.negotiate.method.should.have.been.calledOnce
        nap.negotiate.accept.should.have.been.calledOnce

        var view = (typeof nap.negotiate.accept.args[0][0]["application/x.nap.view"])
          , data = (typeof nap.negotiate.accept.args[0][0]["application/json"])

        view.should.equal('function')
        data.should.equal('function')
      })
    })
  }
)