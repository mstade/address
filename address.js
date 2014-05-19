define(
  [ 'nap'
  , './web!'
  , 'type/type'
  ]
  , function(nap, web, type) {

    function address(r) {

      var uri
        , name
        , method = "get"
        , headers = { accept : "application/x.nap.view" }
        , params = {}
        , body = {}
        , node
        , callback
        , target

      if(r && type.isString(r)) {
        uri = r
      } else if(r && type.isObject(r)) {
        uri = r.uri || uri
        method = r.method || method
        headers = r.headers || headers
        body = r.body || body
      }

      function req() {
        return {
          uri : interpolate(uri, params)
        , method : method
        , headers : headers
        , body : body
        , context : node
        }
      }

      function interpolate(uri, params) {
        if(!Object.keys(params).length) return uri
        return web.uri(uri, params)
      }

      function into(node, err, res) {

        // Make AM legacy apps work with nap.into
        if(res.statusCode == 200) {
          res.headers.contentType = res.headers.contentType.replace("x.am.app", "x.nap.view")
        } 

        nap.into(node)(err, res)
      }

      function api() {
        web.req(req(), function(err, res) {
          node && into(node, err, res)
          callback && callback(err, res)
        })
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

      api.header = function(k, v) {
        if(!arguments.length) return headers
        if(type.isString(k)) {
          headers[k] = v
          return api
        }
        if(type.isObject(k)) {
          Object.keys(k).forEach(function(key) {
            headers[key] = k[key]
          })
          return api
        }

        return api
      }

      api.param = function(k, v) {
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
        if(!arguments.length) return callback
        callback = cb
        return api
      }

      api.into = function(n) {
        if(!arguments.length) return node
        node = n
        return api
      }

      api.target = function(t) {
        if(!arguments.length) return target
        target = t
        return api
      }

      api.navigate = function() {

        var hash = "#" + req().uri

        if(!target) {
          document.location.hash = hash
          return
        }
        
        var href = document.location.href
        href = document.location.hash ? href.replace(/#.*/, hash) : href + hash
        window.open(href, target, '')
      }

      return api
    }

    address.resource = function(name) {
      return web.resource(name)
    }

    address.legacy = function(id) {
      return web.legacyApps[id] || /^layouts/.test(id)
    }
    
    return address
  }
)