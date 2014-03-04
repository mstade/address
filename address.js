define(
  [ 'nap'
  , './web'
  , 'type/type'
  ]
  , function(nap, web, type) {

    function address(r) {

      var api = {}
        , uri = r
        , name
        , method = "get"
        , accept = "application/x.nap.view"
        , params = {}
        , body = {}

      function req() {
        return {
          uri : web.uri(uri, params)
        , method : method
        , headers : {
            accept : accept
          }
        , body : body
        }
      }

      api.uri = function(u) {
        if(!arguments.length) return uri
        uri = u
        return api
      }

      api.method = function(m) {
        if(!arguments.length) return method
        method = m
        return api
      }

      api.accept = function(a) {
        if(!arguments.length) return accept
        accept = a
        return api
      }

      api.params = function(k, v) {
        if(!arguments.length) return params
        if(type.isString(k)) {
          params[k] = v
          return api
        }
        if(type.isObject(k)) {
          Object.keys(k).forEach(function(key) {
            params[key] = k[key]
          })
          return api
        }

        return api
      }

      api.body = function(b) {
        if(!arguments.length) return body
        body = b
        return api
      }

      api.then = function(cb) {
        web.req(req(), cb)
      }

      api.into = function(node) {
        web.req(req(), nap.into(node))
      }

      return api
    }

    address.resource = function(name) {
      return web.resource(name)
    }
    
    return address
  }
)