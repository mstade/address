define(
  [ 'Squire'
  , 'sinon'
  , 'jquery'
  ]
  , function(Squire, sinon, $) {

    var address
      , web
      , nap

    beforeEach(function(done) {

      var injector = new Squire();

      web = { req : sinon.spy() }
      nap = { into : sinon.spy() }

      injector.mock(
        'web'
      , function() {
        return {
          load :  function (name, req, onload, config) {
            onload(web)
          }
        }
      })
      .mock(
        'nap'
      , function() {
        return nap
      })
      .require(
        [ 'address' ]
      , function(a) {
          address = a
          done()
        }
      )
    })

    describe('Address', function() {

      it('should store the resource in the closure', function() {
        address("/wibble").path().should.equal("/wibble")
      })

      it('should call web.req with the resource and callback', function() {
        var cb = sinon.spy()

        address("/wibble").then(cb)

        web.req.should.have.been.calledOnce
        web.req.should.have.been.calledWith("/wibble", cb)
      })

      it('should call nap.into with the node', function() {
        var cb = sinon.spy()
          , node = $("<div class='view'></div>")["0"]

        $("body").append(node)
        address("/wibble").into(node)
        $("body").remove(".view")

        web.req.should.have.been.calledOnce
        web.req.should.have.been.calledWith("/wibble")
        nap.into.should.have.been.calledOnce
        nap.into.should.have.been.calledWith(node)
      })
    })
  }
)