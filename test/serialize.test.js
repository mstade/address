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
        serialize({a: 'b', c: true}).should.equal('?a=b&c=true')
        serialize({a: ['b', 'c']}).should.equal('?a=b&a=c')
        serialize.bind(null, null).should.throw(TypeError)
        serialize.bind(null).should.throw(TypeError)
      })

      it('should use the encoder when specified', function() {
        serialize({'hello world': 'hello world'}, encodeURIComponent).should.equal('?hello%20world=hello%20world')
        serialize({a: {b: 'foo'}}, JSON.stringify).should.equal('?"a"={"b":"foo"}')
      })

      it('should skip values set to undefined', function() {
        serialize({'a': undefined, b: 'c'}).should.equal('?b=c')
      })
    })
  }
)