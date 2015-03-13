define(
  [
    'd3'
  , 'd3-utils/events/dispatch'
  ]
  , function (d3, dispatch) {

    return function createStream() {
      var clientDispatcher = dispatch('message', 'status', 'error')
        , serviceDispatcher = d3.dispatch('last-subscriber-unsubscribed')

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