define(
  [ 'nap'
  , 'd3'
  , 'underscore'
  , './web!'
  , 'type/type'
  , './http-status-code'
  , './is-view'
  , './serialize'
  , './interpolate'
  , './compose'
  , './location'
  ]
  , function(nap, d3, _, web, type, codes, isView, serialize, interpolate, compose, createLocation) {

    var resource = _.property('__resource__')
      , zapp = d3.select('.z-app')
      , root = zapp.empty() ? d3.select('body').node() : zapp.node()
      , location = createLocation(root, web)
    
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
        _.extend(headers, toObject(k, v))
        return api
      }

      api.param = function(k, v) {
        if(!arguments.length) return params
        _.extend(params, toObject(k, v))
        return api
      }

      api.query = function(k, v) {
        if(!arguments.length) return query
        _.extend(query, toObject(k, v))
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

        var requestUri = getRequestUri(root)
        if(!target)  return location.setState(requestUri), null
        location.openNewWindow(requestUri, target)
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
        return {
          uri : getRequestUri(node) + serialize(query)
        , method : method
        , headers : headers
        , body : body
        , context : node
        }
      }

      function getRequestUri(node) {
        var requestUri = interpolate(web, uri, params) 
        if(location.isRoot(node)) requestUri = compose(web, requestUri, resource(node))
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
    address.interpolate = _.partial(interpolate, web)
    address.location = location

    return address

    function toObject(k, v) {
      if(type.isObject(k)) return k
      return obj = {}, obj[k] = v, obj
    }
  }
)