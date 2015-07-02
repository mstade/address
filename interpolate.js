define(function(require) {
  var web = require('./web!')

  return function(uri, params) {
    if (!Object.keys(params).length) return uri
    return web.uri(uri, params)
  }
})
