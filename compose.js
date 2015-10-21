define(function(require) {
    var _ = require('underscore')

    return function(web, interpolate, requestedUri, currentUri) {

      if(!currentUri || requestedUri == currentUri) return requestedUri

      var currentResource = web.find(currentUri)
        , requestedResource = web.find(requestedUri)

      if(!currentResource || !requestedResource) return requestedUri

      var composedParams = _.extend(currentResource.params, requestedResource.params)
        , redirect = currentResource.redirects[requestedResource.path]
        , composes = _.contains(currentResource.composes, requestedResource.path)
        , rewritePath = redirect || currentResource.path
        , shouldRewrite = redirect || composes

      if(shouldRewrite) return interpolate(web, rewritePath, composedParams)
      return requestedUri // TODO query string handling?
    }
  }
)
