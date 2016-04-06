define(function(require) {
    var _ = require('underscore')
      , interpolate = require('./interpolate')
      , rhumb = require('@websdk/rhumb')
      , uri = require('lil-uri')

    return function(web, requestedUri, currentUri) {

      if(!currentUri || requestedUri == currentUri) return requestedUri

      var currentResource = web.find(currentUri)
        , requestedResource = web.find(requestedUri)

      if(!currentResource || !requestedResource) return requestedUri

      var composedParams = _.extend(currentResource.params, requestedResource.params)
        , redirect = currentResource.redirects[requestedResource.path]
        , composes = _.contains(currentResource.composes, requestedResource.path)
        , rewritePath = redirect || currentResource.path
        , shouldRewrite = redirect || composes

      if(shouldRewrite) return rewrite(web, rewritePath, composedParams)

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

      return url.build()

      function byInterpolated(part) {
        return part.type == 'var'
      }

      function buildQuery(q, v, k) {
        if (_.contains(alreadyInterpolated, k)) return q
        q[k] = v
        return q
      }
    }
  }
)
