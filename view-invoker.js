define(function(require) {

  var log = require('logger/log!platform/am-address')
    ,  _ = require('underscore')
    , zapp = require('./z-app')
    , location = require('./location')

  return function(req, res) {

    if (res.statusCode != 200) {
      log.debug('view resource returned non-200 status code. view function not invoked')
      return
    }

    if (req.context === zapp.root()) {
      log.debug('updating location to match resource uri')
      location.setState(req.uri, true)
    }

    if (!_.isFunction(res.body)) {
      log.debug('view resource returned non-function object in response body')
      return
    }

    res.body(req.context)
  }
})
