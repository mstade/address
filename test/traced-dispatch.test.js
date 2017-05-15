define(function(require) {
  var dispatch = require('traced-dispatch')

  describe('Traced dispatch', function() {

    it('should always be able to dispatch a firstsubscribed event', function() {
      dispatcher = dispatch()

      expect(function() {
        dispatcher.call('firstsubscribed')
      }).to.not.throw(Error)
    })

    it('should always be able to dispatch a lastunsubscribed event', function() {
      dispatcher = dispatch()

      expect(function() {
        dispatcher.call('lastunsubscribed')
      }).to.not.throw(Error)
    })

    it('should create a method for all event types passed in the constructor', function() {
      dispatcher = dispatch('test1', 'test2')

      expect(function() {
        dispatcher.call('test1')
      }).to.not.throw(Error)

      expect(function() {
        dispatcher.call('test2')
      }).to.not.throw(Error)

      expect(function() {
        dispatcher.call('test3')
      }).to.throw(Error)
    })

    describe('on', function() {

      it('should add listener to a given event', function(done) {
        dispatcher = dispatch('test')

        dispatcher.on('test', done)
        dispatcher.call('test')
      })

      it('should override any listener if called a second time', function(done) {
        dispatcher = dispatch('test')

        dispatcher.on('test', function() {
          expect('this').to.be('not called')
        })
        dispatcher.on('test', done)
        dispatcher.call('test')
      })

    })

  })

})
