define(function (require) {
  var _ = require('underscore')
    , dispatch = require('d3-dispatch').dispatch

  return function redispatch() {
    var dispatchers = []

    function redispatch() {
      var dispatcher = dispatch.apply(dispatch, dispatchers.reduce(types, []))
      dispatchers.forEach(proxyEvents)

      return dispatcher

      function proxyEvents(d) {
        d.types.forEach(proxyEvent)
        function proxyEvent(type) {
          d.dispatcher.on(type + '.redispatch', function() {
            dispatcher.apply(type, null, _.toArray(arguments))
          })
        }
      }
    }

    redispatch.from = function(dispatcher, eventTypes) {
      dispatchers.push({
        dispatcher: dispatcher
      , types: _.isArray(eventTypes) ? eventTypes : _.rest(arguments)
      })

      return redispatch
    }

    redispatch.eventTypes = function() {
      return dispatchers.reduce(toTypes, [])
    }

    return redispatch

    function types(acc, next) {
      return acc.concat(next.types)
    }

    function toTypes(acc, v, k) {
      return acc.concat(v.types)
    }
  }
})
