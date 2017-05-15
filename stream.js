define(function (require) {
    var _ = require('underscore')
      , dispatch = require('./traced-dispatch')
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

      stream.status = function status() {
        clientDispatcher.apply('status', null, _.toArray(arguments))
      }

      stream.message = function message() {
        clientDispatcher.apply('message', null, _.toArray(arguments))
      }

      stream.error = function error() {
        clientDispatcher.apply('error', null, _.toArray(arguments))
      }

      return rebind(stream, serviceDispatcher, 'on')
    }
  }
)
