define(function(require) {
  return function(web, uri, params) {
    if (!Object.keys(params).length) return uri
    return web.uri(uri, params)
  }
})
