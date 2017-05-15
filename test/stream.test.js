define(function(require) {
  var createStream = require('stream')
    , sinon = require('sinon')

  describe('stream', function() {
    it('should dispatch "firstsubscribed" to service when first subscription is made', function() {
      var callback = sinon.spy()
        , stream = createStream()

      stream.on('firstsubscribed', callback)
      callback.should.not.be.called

      stream.dispatcher.on('message.listener', sinon.spy())
      callback.should.be.calledOnce

      stream.dispatcher.on('status.listener', sinon.spy())
      callback.should.be.calledTwice

      stream.dispatcher.on('error.listener', sinon.spy())
      callback.should.be.calledThrice
    })

    it('should dispatch "lastunsubscribed" to service when last listener unsubscribes', function() {
      var callback = sinon.spy()
        , stream = createStream()

      stream.on('lastunsubscribed', callback)

      stream.dispatcher.on('message.listener', sinon.spy())
      stream.dispatcher.on('status.listener', sinon.spy())
      stream.dispatcher.on('error.listener', sinon.spy())
      callback.should.not.be.called

      stream.dispatcher.on('message.listener', null)
      callback.should.be.calledOnce

      stream.dispatcher.on('status.listener', null)
      callback.should.be.calledTwice

      stream.dispatcher.on('error.listener', null)
      callback.should.be.calledThrice
    })

    it('should dispatch "message" to client when service calls stream instance as a function', function() {
      var callback = sinon.spy()
        , stream = createStream()
        , message = { message: 'hello' }

      stream.dispatcher.on('message', callback)

      stream(message)

      callback.should.be.calledWith(message)
    })

    it('should dispatch "message" to client when service calls stream.message', function() {
      var callback = sinon.spy()
        , stream = createStream()
        , message = { message: 'hello' }

      stream.dispatcher.on('message', callback)

      stream.message(message)

      callback.should.be.calledWith(message)
    })

    it('should dispatch "status" to client when service calls stream.status', function() {
      var callback = sinon.spy()
        , stream = createStream()
        , message = { message: 'hello' }

      stream.dispatcher.on('status', callback)

      stream.status(message)

      callback.should.be.calledWith(message)
    })

    it('should dispatch "error" to client when service calls stream.error', function() {
      var callback = sinon.spy()
        , stream = createStream()
        , message = { message: 'hello' }

      stream.dispatcher.on('error', callback)

      stream.error(message)

      callback.should.be.calledWith(message)
    })
  })
})
