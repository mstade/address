define(
  [
    'd3'
  , 'd3-utils/events/dispatch'
  , 'd3-utils/events/redispatch'
  ]
  , function (d3, dispatch, redispatch) {

    return function createStream() {
      var clientDispatcher = dispatch('message', 'status', 'error')

      var serviceDispatcher = redispatch()
        .from (clientDispatcher, 'first-subscribed', 'last-unsubscribed')()

      function stream() {
        stream.message.apply(this, arguments)
      }

      stream.dispatcher = d3.rebind({}, clientDispatcher, 'on')
      stream.status = clientDispatcher.status
      stream.message = clientDispatcher.message
      stream.error = clientDispatcher.error

      return d3.rebind(stream, serviceDispatcher, 'on')
    }

  }
)