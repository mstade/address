define(
  [
    'd3'
  , '@zambezi/d3-utils/events/dispatch'
  , '@zambezi/d3-utils/events/redispatch'
  ]
  , function (d3, dispatch, redispatch) {

    return function createStream() {
      var clientDispatcher = dispatch('message', 'status', 'error')
        , serviceDispatcher = redispatch()
            .from (clientDispatcher, 'firstsubscribed', 'lastunsubscribed')()

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