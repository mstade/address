define(function(require) {
  var sinon = require('sinon')
    , nap = require('@websdk/nap')
    , address = require('address')
    , middleware = require('middleware')

  describe('Middleware', function() {
    it('should throw error when negative timeout value is provided', function() {
      var resource = sinon.spy()
      var cb = sinon.spy()
      var error

      try {
        address('/wibble/{id}')
          .web(
            nap.web()
              .use(middleware.requestTimeout)
              .resource('wibble', '/wibble/{id}', resource)
          )
          .param('id', '123')
          .timeout(-10)
          .on('done', cb)()
      } catch (e) {
        error = e
      } finally {
        cb.should.not.have.been.called
        resource.should.not.have.been.called
        error.message.should.equal('Invalid timeout: must be an integer value greater than 0')
      }
    })

    it('should return error when null timeout value is provided', function() {
      var resource = sinon.spy()
      var cb = sinon.spy()
      var error

      try {
        address('/wibble/{id}')
          .web(
            nap.web()
              .use(middleware.requestTimeout)
              .resource('wibble', '/wibble/{id}', resource)
          )
          .param('id', '123')
          .timeout(null)
          .on('done', cb)()
      } catch (e) {
        error = e
      } finally {
        cb.should.not.have.been.called
        resource.should.not.have.been.called
        error.message.should.equal('Invalid timeout: must be an integer value greater than 0')
      }
    })

    it('should set timeout to 30 seconds by default', function() {
      address('/wibble/{id}')
          .web(
            nap.web()
              .use(middleware.requestTimeout)
              .resource('wibble', '/wibble/{id}', assertDefaultTimeout)
          )
        .param('id', '123')
        .on('done', function() {})()

      function assertDefaultTimeout(req, res) {
        req.timeout.should.equal(30)
      }
    })
  })
})