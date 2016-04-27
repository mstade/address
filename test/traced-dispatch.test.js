define(function(require) {
  var dispatch = require('traced-dispatch')

  describe('Traced dispatch', function() {

    it('should always be able to dispatch a firstsubscribed event', function() {
      dispatcher = dispatch()

      expect(dispatcher.firstsubscribed).to.be.a('function')
    })

    it('should always be able to dispatch a lastunsubscribed event', function() {
      dispatcher = dispatch()

      expect(dispatcher.lastunsubscribed).to.be.a('function')
    })

    it('should create a method for all event types passed in the constructor', function() {
      dispatcher = dispatch('test1', 'test2')

      expect(dispatcher.test1).to.be.a('function')
      expect(dispatcher.test2).to.be.a('function')
      expect(dispatcher.test3).not.to.be.a('function')
    })

    describe('on', function() {

      it('should add listener to a given event', function(done) {
        dispatcher = dispatch('test')

        dispatcher.on('test', done)
        dispatcher.test()
      })

      it('should override any listener if called a second time', function(done) {
        dispatcher = dispatch('test')

        dispatcher.on('test', function() {
          expect('this').to.be('not called')
        })
        dispatcher.on('test', done)
        dispatcher.test()
      })

    })

  })

})
