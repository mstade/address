define(function(require) {

  var log = require('logger/log!platform/am-address')
    , _ = require('underscore')

  return function(req, res) {

    if (res.statusCode != 200) {
      log.debug('view resource returned non-200 status code. view function not invoked')
      return
    }

    if (!_.isFunction(res.body)) {
      log.debug('view resource returned non-function object in response body')
      return
    }

    res.body(req.context)
  }
})
