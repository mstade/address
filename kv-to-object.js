define(function(require) {
  var _ = require('underscore')
  return function kvToObject(k, v) {
    var obj
    if(_.isObject(k)) return k
    obj = {}
    obj[k] = v
    return obj
  }
})

