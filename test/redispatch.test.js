define(function(require) {
  var sinon = require('sinon')
    , createRedispatch = require('redispatch')
    , dispatch = require('traced-dispatch')

  describe('Re dispatch', function() {

    var dispatcher

    beforeEach(function() {
      dispatcher = dispatch('test', 'message', 'close')
    })

    it('should redispatch an event with the .redispatch suffix', function(done) {
      var redispatch = createRedispatch().from(dispatcher, 'test')()
      redispatch.on('test.redispatch', done)
      dispatcher.call('test')
    })

    it('should redispatch an event with the .redispatch suffix', function() {
      var redispatch = createRedispatch().from(dispatcher, ['test', 'message'])()
        , callback = sinon.spy()
        , message = { message: 'hello' }
      redispatch.on('test.redispatch', callback)
      redispatch.on('message.redispatch', callback)

      dispatcher.call('test')
      callback.should.be.calledOnce
      dispatcher.call('message', null, message)
      callback.should.be.calledTwice
      callback.should.be.calledWith(message)
    })

    it('factory should return all the associated event types', function() {
      createRedispatch().from(dispatcher, 'test')
        .eventTypes().should.deep.equal(['test'])

      createRedispatch().from(dispatcher, ['test', 'message'])
        .eventTypes().should.deep.equal(['test', 'message'])

      createRedispatch().from(dispatcher, 'test', 'message')
        .eventTypes().should.deep.equal(['test', 'message'])
    })
  })
})
