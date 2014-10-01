define(
  [ 'nap'
  , 'd3'
  , 'underscore'
  , './web!'
  , 'type/type'
  , './http-status-code'
  ]
  , function(nap, d3, _, web, type, codes) {

    var root = d3.select('.shell-resource').on('click', handleClick).node()
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
        , resource = _.property('__resource__')

      if(r && type.isString(r)) {
        uri = r
      } else if(r && type.isObject(r)) {
        uri = r.uri || uri
        method = r.method || method
        headers = r.headers || headers
        body = r.body || body
      }

      function api() {
        var request = req()
        web.req(request, handleResponse(request))
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

        root && root.on('click', null)

        root = r
        d3.select(root).on("click", handleClick)

        return api
      }

      api.into = function(n) {
        if(type.isString(n)) n = d3.select(n).node()

        node = !arguments.length ? root : n
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
          api.into().on('redirection', handleRedirect).get()
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

      function req() {

        var requestUri = interpolate(uri, params) 
        if(isRoot(node)) requestUri = compose(requestUri, resource(node))

        return {
          uri : requestUri + serialize(query)
        , method : method
        , headers : headers
        , body : body
        , context : node
        }
      }

      function compose(requestUri, rootUri) {

        if(!rootUri) return requestUri

        var rootResource = web.find(rootUri)
          , resource = web.find(requestUri)
          , composedParams = _.extend(rootResource.params, resource.params)
          , redirect = rootResource.redirects[resource.path]
          , composes = _.contains(rootResource.composes, resource.path)
          , rewritePath = redirect || rootResource.path
          , shouldRewrite = redirect || composes

        if(shouldRewrite) {

          api.header({ 
            'x-original-request-uri' : requestUri
          , 'x-original-request-params' : resource.params 
          , 'x-composed-request-params' : composedParams
          })

          return interpolate(rewritePath, composedParams)
        }

        return requestUri
      }

      function serialize(query) {
        var params = Object.keys(query).reduce(function(a,k) {
          a.push(k + '=' + query[k])
          return a
        },[])
        return params.length ? '?' + params.join('&') : ''
      }


      function handleResponse(req) {
        return function(err, res) {

          if(isView(res)) handleView(res, req.uri)

          // deprecated
          callback && callback(err, res)

          if(err) return dispatcher.err(err), null

          codes(res.statusCode).forEach(function(type) { 
            dispatcher[type](res) 
          })
          dispatcher.done(res)
        }
      }

      function handleView(res, requestUri) {
        var view = res.body

        if(!type.isFunction(view)) return
        if(res.statusCode != 200) return
          
        res.body = function(node) {
          if(isRoot(node) && resource(node) != requestUri) {
            window.history.pushState({}, "", "#" + requestUri)
          }
          node.__resource__ = requestUri
          view(node)
        }
        
        node && into(node, res)
      }

      function into(node, res) {
        node.dispatchEvent && node.dispatchEvent(new CustomEvent("update"))
        res.body(node)
      }

      function isRoot(node) {
        return node == root
      }
    }

    address.find = function(uri) {
      return web.find(uri)
    }

    address.interpolate = interpolate

    return address

    function interpolate(uri, params) {
      if(!Object.keys(params).length) return uri
      return web.uri(uri, params)
    }

    function isView(res) {
      if(!res.headers.contentType) return
      return !!viewTypes[res.headers.contentType]
    }

    function handleClick() {
      var event = d3.event
        , target = event.target

      if(!target.href) return
      event.preventDefault()
      event.stopPropagation()
      var resource = target.href.split('#')[1]

      address(resource)
        .into()
        .on('redirection', handleRedirect)
        .get()
    }

    function handleRedirect(res) {

      address(res.headers.location)
        .into()
        .on('redirection', handleRedirect)
        .get()
    }
  }
)