define(
  [ 'nap'
  , 'rhumb'
  , './parser'
  , './middleware'
  , 'd3'
  , 'type/type'
  , './load-resources'
  ]
, function(nap, rhumb, parser, middleware, d3, type, loadResources) {

    var web
      , routes


    return {
      load: function (name, req, onload, config) {

        if (config.isBuild) {
          onload()
          return
        }

        web = nap.web()
          .use(middleware.logger)
          .use(middleware.requestTimeout)


        loadResources(
            window.z
          , '/api/bootshell/v1/resources'
          , loadResourcesHandler
          )

        function loadResourcesHandler(err, resources) {
          if (err) {
            // log.error(err.message)
            return createWeb([])
          }
          createWeb(resources)
        }

        function createWeb(resources) {

          parser.parseResources(resources).forEach(function(resource) {
            store(resource)
            var args = resource.name ? [resource.name] : []
            web.resource.apply(null, args.concat([resource.path, resource.fn]))
          })

          web.find = function(uri) {
            return routes.match(uri)
          }

          onload(web)
        }

      }
    }

    function store(resource) {
      routes = routes || rhumb.create()

      routes.add(resource.path, function(params){

        var methods = type.isObject(resource.methods) ? Object.keys(resource.methods) : null

        return {
          name : resource.name
        , path : resource.path
        , methods : methods
        , params : params
        , composes : resource.composes || []
        , redirects : resource.redirects || {}
        }
      })
    }

    function isInvalidResponse(err, data) {
      return err || !data.resources || !type.isArray(data.resources)
    }

  }
)

