define(
  [
    'd3'
  , 'type/type'
  ]

, function(d3, type) {

    return loadResources

    function loadResources(fromObject, fromService, callback) {

      if (isResourceObject(fromObject)) return callback(null, resolve(fromObject))

      d3.json(fromService, function loadResourcesHandler(err, data) {
        if (isInvalid(err, data)) {
          return callback(loadError(fromService))
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
      return data.resources || []
    }

    function loadError(fromService) {
      return new Error('Failed to retrieve resources from "' + fromService + '".')
    }

  }
)
