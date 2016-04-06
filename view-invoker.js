define(function(require) {

  var _ = require('underscore')

  return function(req, res) {
    if (res.statusCode != 200) return
    if (!_.isFunction(res.body)) return
    res.body(req.context)
  }
})
