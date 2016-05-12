define(function(require) {
  var redirect = require('redirect')

  describe('Redirect', function() {
    it('should return a redirect object', function() {
      redirect('/foo/bar?x=y').should.deep.equal({
        statusCode : 302
      , headers : {
          location : '/foo/bar?x=y'
        }
      })
    })

    it('should return encode query string in the redirect location', function() {
      redirect('/foo?@bar%/=%?').statusCode.should.equal(302)
      redirect('/foo?@bar%/=%?').headers.location.should.equal('/foo?%40bar%25%2F=%25%3F')

      redirect('/baz?%=%2f').statusCode.should.equal(302)
      redirect('/baz?%=%2f').headers.location.should.equal('/baz?%25=%2F')
    })
  })
})