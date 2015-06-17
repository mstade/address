define(function(require) {
  return function kvToObject(k, v) {
    if(_.isObject(k)) return k
    return obj = {}, obj[k] = v, obj
}
})
