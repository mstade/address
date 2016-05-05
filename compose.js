define(function(require) {
  var _ = require('underscore')
    , interpolate = require('./interpolate')
    , rhumb = require('@websdk/rhumb')
    , uri = require('./uri')

  return function(web, requestedUri, currentUri) {

    if(!currentUri || requestedUri == currentUri) return requestedUri

    var currentResource = web.find(currentUri)
      , requestedResource = web.find(requestedUri)

    if(!currentResource || !requestedResource) return requestedUri

    var composedParams
      , redirect = currentResource.redirects[requestedResource.path]
      , composes = _.contains(currentResource.composes, requestedResource.path)
      , rewritePath = redirect || currentResource.path
      , shouldRewrite = redirect || composes

    if(shouldRewrite) {
      composedParams = _.extend(
        _.mapObject(currentResource.params, decode)
      , _.mapObject(requestedResource.params, decode)
      )
      return rewrite(web, rewritePath, composedParams)
    }

    return requestedUri
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

  function decode(value) {
    return value ? decodeURIComponent(value) : ''
  }
})
