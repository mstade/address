define(function(require) {

  var d3 = require('d3')
    , _ = require('underscore')

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
    return !!object && _.isArray(object.resources)
  }

  function isInvalid(err, data) {
    return err || !isResourceObject(data)
  }

  function resolve(data) {
    return data.resources
  }

  function loadError(fromService) {
    return new Error('Failed to retrieve resources from "' + fromService + '".')
  }

})
