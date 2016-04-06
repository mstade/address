define(function (require) {
    var dispatch = require('./traced-dispatch')
      , redispatch = require('./redispatch')
      , rebind = require('./rebind')

    return function createStream() {
      var clientDispatcher = dispatch('message', 'status', 'error')
        , serviceDispatcher = redispatch()
            .from(clientDispatcher, 'firstsubscribed', 'lastunsubscribed')()

      function stream() {
        stream.message.apply(this, arguments)
      }

      stream.dispatcher = rebind({}, clientDispatcher, 'on')
      stream.status = clientDispatcher.status
      stream.message = clientDispatcher.message
      stream.error = clientDispatcher.error

      return rebind(stream, serviceDispatcher, 'on')
    }

  }
)