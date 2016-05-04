define(function(require) {
  var _ = require('underscore')
  return function(query, encode) {
    encode = encode || _.identity
    var params = Object.keys(query).reduce(function(list, key) {
          var value = query[key]

          if (_.isUndefined(value)) return list
          if (_.isArray(value)) return list.concat(value.map(encodeKV))

          return list.concat(encodeKV(value))

          function encodeKV(v) {
            return encode(key) + '=' + encode(v)
          }
        }, [])

    return params.length ? '?' + params.join('&') : ''
  }
})