define(function(require) {
  var _ = require('underscore')
    , interpolate = require('./interpolate')
    , rhumb = require('@websdk/rhumb')
    , uri = require('./uri')

  return function(web, requestedUri, currentUri) {

    if(!currentUri || requestedUri == currentUri) return requestedUri

    var currentResource = web.find(currentUri)
      , currentMetadata = repairResource(currentResource).metadata
      , requestedResource = web.find(requestedUri)
      , requestedMetadata = repairResource(requestedResource).metadata

    if(!currentResource || !requestedResource) return requestedUri

    var composedParams
      , redirect = currentMetadata.redirects[requestedMetadata.path]
      , composes = _.contains(currentMetadata.composes, requestedMetadata.path)
      , rewritePath = redirect || currentMetadata.path
      , shouldRewrite = redirect || composes

    if(shouldRewrite) {
      composedParams = _.extend(
        _.mapObject(currentResource.params, uri.decode)
      , _.mapObject(requestedResource.params, uri.decode)
      )
      return rewrite(web, rewritePath, composedParams)
    }

    return requestedUri
  }

  // Because of the lack of documentation, there are uses of address where a set of customisation have been made:
  // + `web.find` is overridden.
  // + metadata properties is stored on the route resource itself, rather than on `resource.metadata`.
  //
  // In a future release we may want to deprecate or remove this behaviour.
  // Further details can be found: https://github.com/zambezi/address/issues/59
  function repairResource(resource) {
    return _.extend({ metadata: resource }, resource)
  }

  function rewrite(web, path, params) {
    var alreadyInterpolated = _.chain(rhumb._parse(path))
          .flatten()
          .filter(byInterpolated)
          .map('input')
          .value()
      , query = _.reduce(params, buildQuery, {})
      , rewritten = interpolate(web, path, params)
      , url = uri(rewritten)

    if (!_.isEmpty(query)) url.query(_.extend({}, url.query(), query))

    return url.path()

    function byInterpolated(part) {
      return part.type == 'var'
    }

    function buildQuery(q, v, k) {
      if (_.contains(alreadyInterpolated, k)) return q
      q[k] = v
      return q
    }
  }
})
