define(
  ['type/type'
  ]
, function(type) {
    return function(k, v) {
      if(type.isObject(k)) return k
      return obj = {}, obj[k] = v, obj
    }
  }
)