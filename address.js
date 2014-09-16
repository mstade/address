define(
  [ 'nap'
  , 'd3'
  , './web!'
  , 'type/type'
  , './http-status-code'
  ]
  , function(nap, d3, web, type, codes) {

    var root
      , viewTypes = {
        "application/x.nap.view" : true
      , "application/x.am.app" : true
      , "application/x.am.legacy-app" : true
      }

    function address(r) {

      var uri
        , name
        , method = "get"
        , headers = { accept : "application/x.nap.view" }
        , params = {}
        , query = {}
        , body
        , node
        , callback
        , target
        , dispatcher = d3.dispatch.apply(null, codes.range().concat(['err', 'done']))

      if(r && type.isString(r)) {
        uri = r
      } else if(r && type.isObject(r)) {
        uri = r.uri || uri
        method = r.method || method
        headers = r.headers || headers
        body = r.body || body
      }

      function req() {

        var requestUri = interpolate(uri, params) 
        
        if(node && node == root && node.__resource__) {

          var rootUri = node.__resource__
            , rootResource = web.find(rootUri)
            , rootParams = rootResource.params
            , rootPath = rootResource.path
            , resource = web.find(requestUri)
            , resourcePath = resource.path
            , resourceParams = resource.params

          if(rootResource.composes && !!~rootResource.composes.indexOf(resourcePath)) {
            var composedParams = mergeParams(resourceParams, rootParams)
            requestUri = interpolate(rootPath, composedParams)
          }
        }

        return {
          uri : requestUri + serialize(query)
        , method : method
        , headers : headers
        , body : body
        , context : node
        }
      }

      function mergeParams(source, target) {
        var composedParams = {}
        Object.keys(target).forEach(function(key) {
          composedParams[key] = source[key] || target[key]
        })
        return composedParams
      }

      function interpolate(uri, params) {
        if(!Object.keys(params).length) return uri
        return web.uri(uri, params)
      }

      function serialize(query) {
        var params = Object.keys(query).reduce(function(a,k) {
          a.push(k + '=' + query[k])
          return a
        },[])
        return params.length ? '?' + params.join('&') : ''
      }

      function into(node, err, res, uri) {
        if(res.statusCode != 200) return
        if(!res.headers.contentType) return
        if(!viewTypes[res.headers.contentType]) return
        if(!type.isFunction(res.body)) return
        if(!node) return

        node.dispatchEvent && node.dispatchEvent(new CustomEvent("update"))
        res.body(node)

        if(node == root) window.history.pushState({}, "", "#" + uri)
      }

      function api() {
        var request = req()
        web.req(request, function(err, res) {
          node && into(node, err, res, request.uri)
          callback && callback(err, res)

          if(err) return dispatcher.err(err), null

          codes(res.statusCode).forEach(function(type) { 
            dispatcher[type](res) 
          })
          dispatcher.done(res)
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

      api.query = function(k, v) {
        if(!arguments.length) return query
        if(type.isString(k)) {
          query[k] = v
          return api
        }
        if(type.isObject(k)) {
          Object.keys(k).forEach(function(key) {
            query[key] = k[key]
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
        console.log("deprecated : address.then(). please use event api instead.")
        if(!arguments.length) return callback
        callback = cb
        return api
      }

      api.root = function(r) {
        if(!arguments.length || root) return root
        if(type.isString(r)) r = d3.select(r).node()

        root = r
        d3.select(root).on("click", handleClick)
        return api
      }

      api.into = function(n) {

        api.root(d3.select('.shell-resource').node())

        if(type.isString(n)) n = d3.select(n).node()

        node = n || root
        return api
      }

      api.target = function(t) {
        if(!arguments.length) return target
        target = t
        return api
      }

      api.navigate = function(t) {

        t && api.target(t)

        if(!target) {
          api.into().get()
          return
        }
        
        var hash = "#" + req().uri
          , href = document.location.href

        href = /#/.test(href) ? href.replace(/#.*/, hash) : href + hash
        window.open(href, target, '')
      }

      api.view = function() {
        return api.header('accept','application/x.nap.view')
      }

      api.app = function() {
        return api.header('accept','application/x.am.app')
      }

      api.stream = function() {
        return api.header('accept','application/x.am.stream')
      }

      api.json = function() {
        return api.header('accept','application/json')
      }

      api.xml = function() {
        return api.header('accept','text/xml')
      }

      api.text = function() {
        return api.header('accept','text/plain')
      }

      api.get = function() {
        api.method('get')()
      }

      api.post = function(body) {
        api.method('post').body(body)()
      }      

      api.send = function(body) {
        api.method('send').body(body)()
      }

      api.put = function(body) {
        api.method('put').body(body)()
      }

      api.patch = function(body) {
        api.method('patch').body(body)()
      }

      api.remove = function(body) {
        api.method('remove').body(body)()
      }

      return d3.rebind(api, dispatcher, 'on')
    }

    address.find = function(uri) {
      return web.find(uri)
    }

    return address

    function handleClick() {
      var event = d3.event
        , target = event.target

      if(!target.href) return
      event.preventDefault()
      var resource = target.href.split('#')[1]
      console.log("intercept: ", resource)

      address(resource).into().get()
    }
  }
)