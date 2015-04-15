define(
  [
    'rhumb'
  , 'd3'
  , './parser'
  , 'type/type'
  ]

, function(rhumb, d3, parser, type) {

    return loadResources

    function loadResources(fromObject, fromService, callback) {
      if (isResourceObject(fromObject)) return callback(null, resolve(fromObject))
      d3.json(fromService, function loadResourcesHandler(err, data) {
        if (isInvalid(err, data)) {
          return callback(loadError(fromService), resolveWithEmpty())
        }
        callback(null, resolve(data))
      })
    }

    function isResourceObject(object) {
      return !!object && type.isArray(object.resources)
    }

    function isInvalid(err, data) {
      return err || !isResourceObject(data)
    }

    function resolve(data) {
      return {}
    }

    function loadError(fromService) {
      return new Error('Failed to retrieve resources from "' + fromService + '".')
    }

    function resolveWithEmpty() {
      return resolve({ resources: [] })
    }

  }
)
