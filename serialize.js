define(function(require) {
  var _ = require('underscore')
  return function(query, encode) {
    encode = encode || _.identity
    var sep = '&'
      , eq = '='
      , params = Object.keys(query).reduce(function(list, key) {
          var ks = encode(key) + eq,
              value = query[key]

          if (_.isUndefined(value)) return list
          if (_.isArray(value)) return list.concat(value.map(getEncodedValue).join(sep))

          return list.concat(getEncodedValue(value))

          function getEncodedValue(v) {
            return ks + encode(v)
          }
        }, [])

    return params.length ? '?' + params.join(sep) : ''
  }
})