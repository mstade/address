define(function(require) {
  var redispatch = require('redispatch')
    , dispatch = require('traced-dispatch')

  describe('Re dispatch', function() {

    var redispatcher
      , dispatcher

    beforeEach(function() {
      dispatcher =  dispatch('test')
      redispatcher = redispatch().from(dispatcher, 'test')()
    })

    it('should redispatch an event with the .redispatch suffix', function(done) {
      redispatcher.on('test.redispatch', done)
      dispatcher.test()
    })

  })

})
