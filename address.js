define(function(require) {

  var _ = require('underscore')
    , nap = require('@websdk/nap')
    , zapp = require('./z-app')
    , codes = require('./http-status-code')
    , isView = require('./is-view')
    , isStream = require('./is-stream')
    , interpolate = require('./interpolate')
    , compose = require('./compose')
    , wrapView = require('./view-wrapper')
    , invokeView = require('./view-invoker')
    , toObject = require('./kv-to-object')
    , parseUri = require('./uri')
    , error = require('./error')
    , dispatch = require('d3-dispatch').dispatch
    , rebind = require('./rebind')

    function address(r) {

      var uri
        , web
        , location
        , method = "get"
        , headers = { accept : "application/x.nap.view" }
        , params = {}
        , query = {}
        , body
        , origin
        , callback
        , target
        , into
        , dispatcher = dispatch.apply(null, codes.range().concat(['err', 'done']))

      if(r && _.isString(r)) {
        uri = r
        query = parseUri(uri).query() || query
      } else if(r && _.isObject(r)) {
        uri = r.uri || uri
        query = r.query || query
        method = r.method || method
        headers = r.headers || headers
        body = r.body || body
      }

      function api() {
        var request = req()

        // this should be removed once this issues are fixed
        // https://github.com/websdk/nap/issues/34
        if (!request.uri || request.uri === 'undefined') return bail()
        function bail() {
          var err = error(400, {
            message: 'request is missing URI'
          })
          codes(err.statusCode).forEach(function(type) {
            console.debug(err.statusCode, type, err.body.message, request.method)
            dispatcher[type](err)
          })
        }

        web.req(request, _.partial(handleResponse, request, callback))
      }

      api.web = function(w) {
        if(!arguments.length) return web
        web = w
        location = require('./location')(web, address)
        return api
      }

      api.web(nap.web())

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

      api.into = function(v) {
        into = v || null
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

        var request = req()
          , root =  zapp.root(origin)
          , isLocalRoot = root !== zapp.root()

        if (target) return location.openNewWindow(request.uri, target)
        if (isLocalRoot) return api.into(root)()
        return location.setState(request.uri)
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

      return rebind(api, dispatcher, 'on')

      function req() {
        var context = getContext()

        return {
          uri : getUri()
        , method : method
        , headers : headers
        , body : body
        , context : context
        , origin: origin
        }

        function getUri() {
          var interpolatedUri = interpolate(web, uri, params)
            , parsedUri = parseUri(interpolatedUri)
            , q = _.extend({}, parsedUri.query(), query)
            , mergedUri = (_.isEmpty(q) ? parsedUri : parsedUri.query(q)).path()

          if (!zapp.isRoot(context)) return mergedUri
          return compose(web, mergedUri, zapp.resource(context))
        }

        function getContext() {
          if (!isView({headers: headers})) return undefined
          if (_.isString(into)) return zapp.root(origin).querySelector(into)
          if (_.isNull(into) || _.isUndefined(into)) return zapp.root(origin)
          return into
        }

      }

      function handleResponse(req, callback, err, res) {

        // deprecated //
        callback && callback(err, res)

        if (err) return dispatcher.err(err), null

        req.params = _.mapObject(req.params, decodeURIComponent)

        if (isView(res)) {
          if (res.statusCode != 302) wrapView(location, req, res)
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

    return address
  }
)
