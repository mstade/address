define(
  [ 'nap'
  , 'd3'
  , 'underscore'
  , './web!'
  , 'type/type'
  , './http-status-code'
  ,'./location'
  , './is-view'
  ]
  , function(nap, d3, _, web, type, codes, location, isView) {

    var resource = _.property('__resource__')

    location.root(d3.select('.shell-resource').node())

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

      function api() {
        var request = req()
        web.req(request, _.partial(handleResponse, request))
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
        if(!arguments.length) return location.root()
        location.root(r)
        return api
      }

      api.into = function(n) {
        if(type.isString(n)) n = d3.select(n).node()

        node = !arguments.length ? location.root() : n
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

      function handleResponse(req, err, res) {

        // deprecated //
        callback && callback(err, res)

        if(err) return dispatcher.err(err), null

        if(isView(res) && req.context) invokeView(res, req.context)

        codes(res.statusCode).concat(['done']).forEach(function(type) { 
          dispatcher[type](res) 
        })
      }

      function invokeView(res, node) {

        if(res.statusCode != 200) {
          log.debug('view resource returned non-200 status code. view function not invoked')
          return
        }

        if(!type.isFunction(res.body)) {
          log.debug('view resource returned non-function object in response body')
          return
        }

        res.body(node)
      }
    }

    address.find = web.find
    address.interpolate = interpolate

    return address

    function interpolate(uri, params) {
      if(!Object.keys(params).length) return uri
      return web.uri(uri, params)
    }

    function isRoot(node) {
      return node == location.root()
    }

    function serialize(query) {
      var params = Object.keys(query).reduce(function(a,k) {
        a.push(k + '=' + query[k])
        return a
      },[])
      return params.length ? '?' + params.join('&') : ''
    }
  }
)