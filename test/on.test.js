define(function(require) {
  var on = require('on')
    , _ = require('underscore')

  describe('On', function() {
    var node

    beforeEach(function () {
      node = document.createElement('div')
      document.body.appendChild(node)
    })

    afterEach(function() {
      document.body.removeChild(node)
    })

    it('should add listener to DOM elements', function(done) {
      on.call(node, 'click', callback(done))
      node.dispatchEvent(new CustomEvent('click'))
    })

    it('should only listen to the last added callback', function(done) {
      on.call(node, 'click', errors)
      on.call(node, 'click', callback(done))

      node.dispatchEvent(new CustomEvent('click'))
    })

    it('should listen to namespaced events', function(done) {
      on.call(node, 'click.namespaced', callback(done))

      node.dispatchEvent(new CustomEvent('click'))
    })

    it('should add multiple events with different namespaces', function(done) {
      var next = _.after(2, callback(done))
      on.call(node, 'click.namespace1', next)
      on.call(node, 'click.namespace2', next)

      node.dispatchEvent(new CustomEvent('click'))
    })

    it('should remove the listener when listener is set to null', function(done) {
      on.call(node, 'click.namespace1', errors)
      on.call(node, 'click.namespace1', null)

      node.dispatchEvent(new CustomEvent('click'))
      setTimeout(done, 100)
    })

    it('should remove all listeners with a namespace when set without type without a listener', function(done) {
      on.call(node, 'click.namespace1', errors)
      on.call(node, '.namespace1', null)

      node.dispatchEvent(new CustomEvent('click'))
      setTimeout(function () {
        on.call(node, 'click.namespace1', callback(done))
        on.call(node, '.namespace1', errors)
        node.dispatchEvent(new CustomEvent('click'))
      }, 100)
    })
  })

  function errors() {
    true.should.be.false
  }

  function callback(cb) {
    return function () {
      cb()
    }
  }
})
