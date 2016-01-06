define(function(require) {
    var _ = require('underscore')
      , web = require('./web!')
      , interpolate = require('./interpolate')
      , rhumb = require('rhumb')
      , uri = require('lil-uri')

    return function(requestedUri, currentUri) {

      if(!currentUri || requestedUri == currentUri) return requestedUri

      var currentResource = web.find(currentUri)
        , requestedResource = web.find(requestedUri)

      if(!currentResource || !requestedResource) return requestedUri

      var composedParams = _.extend(currentResource.params, requestedResource.params)
        , redirect = currentResource.redirects[requestedResource.path]
        , composes = _.contains(currentResource.composes, requestedResource.path)
        , rewritePath = redirect || currentResource.path
        , shouldRewrite = redirect || composes

      if(shouldRewrite) return rewrite(rewritePath, composedParams)

      return requestedUri
    }

    function rewrite(path, params) {
      var alreadyInterpolated = _.chain(rhumb._parse(path))
              .filter(byInterpolated)
              .pluck('input')
          .value()
        , query = _.reduce(params, buildQuery, {})
        , rewritten = interpolate(path, params)
        , url = uri(rewritten)

      url.query(_.extend({}, url.query(), query))

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
