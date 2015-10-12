define(
  [ 'Squire' ]
  , function(Squire) {
    describe('Serialize', function() {

      var serialize

      beforeEach(function(done) {

        var injector = new Squire()

        injector.require(
            [ 'serialize' ]
          , function(r) {
            serialize = r
            done()
          }
        )
      })

      it('should return key/value pairs as a query string', function() {
        serialize({}).should.equal('')
        serialize({a: 'b'}).should.equal('?a=b')
        serialize({a: 'b', c: 'd'}).should.equal('?a=b&c=d')
        serialize.bind(null, null).should.throw(TypeError)
        serialize.bind(null).should.throw(TypeError)
      })
    })
  }
)