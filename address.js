define(function(require) {

  var nap = require('nap')
    , d3 = require('d3')
    , _ = require('underscore')
    , web = require('./web!')
    , zapp = require('./z-app')
    , codes = require('./http-status-code')
    , isView = require('./is-view')
    , isStream = require('./is-stream')
    , serialize = require('./serialize')
    , interpolate = require('./interpolate')
    , compose = require('./compose')
    , location = require('./location')
    , wrapView = require('./view-wrapper')
    , invokeView = require('./view-invoker')
    , toObject = require('./kv-to-object')

    function address(r) {

      var uri
        , name
        , method = "get"
        , headers = { accept : "application/x.nap.view" }
        , params = {}
        , query = {}
        , body
        , context
        , origin
        , callback
        , target
        , dispatcher = d3.dispatch.apply(null, codes.range().concat(['err', 'done']))

      if(r && _.isString(r)) {
        uri = r
      } else if(r && _.isObject(r)) {
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
        if(_.isString(n)) n = d3.select(n).node()
        context = !arguments.length ? zapp.root() : n
        return api
      }

      api.target = function(t) {
        if(!arguments.length) return target
        target = t
        return api
      }

      api.origin = function(n) {
        if(!arguments.length) return origin
        origin = n
        return api
      }

      api.navigate = function(t) {
        if (t) api.target(t)
        if (target) return location.openNewWindow(req().uri, target)
        api.into(zapp.root(origin))()
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
          uri : getUri() + serialize(query)
        , method : method
        , headers : headers
        , body : body
        , context : context
        , origin: origin
        }

        function getUri() {
          var u = interpolate(uri, params)
          if (!zapp.isRoot(context)) return u
          return compose(u, zapp.resource(context))
        }
      }

      function getRequestUri(requestNode) {
        var requestUri = interpolate(uri, params)
        if(!zapp.isRoot(requestNode)) return requestUri
        return compose(requestUri, zapp.resource(requestNode))
      }

      function handleResponse(req, callback, err, res) {

        // deprecated //
        callback && callback(err, res)

        if(err) return dispatcher.err(err), null

        if(isView(res)) {
          if(res.statusCode != 302) wrapView(req, res)
          req.context && invokeView(req, res)
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
    address.interpolate = interpolate
    address.location = location
    return address
  }
)
