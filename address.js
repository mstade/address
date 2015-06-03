define(
  [ 'nap'
  , 'd3'
  , 'underscore'
  , './web!'
  , './zapp'
  , 'type/type'
  , './http-status-code'
  , './is-view'
  , './is-stream'
  , './serialize'
  , './interpolate'
  , './compose'
  , './location'
  , './view-wrapper'
  , './view-invoker'
  , './kv-to-object'
  ]
  , function(
    nap
  , d3
  , _
  , web
  , zapp
  , type
  , codes
  , isView
  , isStream
  , serialize
  , interpolate
  , compose
  , location
  , wrapView
  , invokeView
  , toObject
  ) {

    var resource = _.property('__resource__')

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
        web.req(request, _.partial(handleResponse, request, callback))
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

        node = !arguments.length ? zapp.root() : n
        return api
      }

      api.target = function(t) {
        if(!arguments.length) return target
        target = t
        return api
      }

      api.navigate = function(t) {

        t && api.target(t)

        var requestUri = getRequestUri(zapp.root()) + serialize(query)
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
        return api.header('accept','application/x.zap.stream')
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
        if(zapp.isRoot(node)) requestUri = compose(web, requestUri, resource(node))
        return requestUri
      }

      function handleResponse(req, callback, err, res) {

        // deprecated //
        callback && callback(err, res)

        if(err) return dispatcher.err(err), null

        if(isView(res)) {
          if(res.statusCode != 302) wrapView(req, res)
          req.context && invokeView(res, req.context)
        }

        if (isStream(res)) {
          if (res.body && res.body.dispatcher) {
            res.body = res.body.dispatcher
          }
        }

        codes(res.statusCode).concat(['done']).forEach(function(type) {
          dispatcher[type](res)
        })
      }
    }

    address.find = web.find
    address.interpolate = _.partial(interpolate, web)
    address.location = location

    return address
  }
)
