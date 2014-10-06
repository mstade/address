define(
  [ 'nap'
  , 'rhumb'
  , './parser' 
  , './middleware'
  , 'd3'
  , 'type/type'
  ]
, function(nap, rhumb, parser, middleware, d3, type) {

    var web
      , routes

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

    return {
      load: function (name, req, onload, config) {

        if (config.isBuild) {
          onload()
          return
        }

        web = nap.web()
          .use(middleware.logger)
          .use(middleware.requestTimeout)
          .use(middleware.view)

        d3.json("/api/apps/v1/resources", function(err, data) {

          if(err || !data.resources || !type.isArray(data.resources)) {
            //log.error("Failed to retrieve resources")
            data = { resources : [] }
          }

          var resources = parser.parseResources(data.resources)

          resources.forEach(function(resource) {
            store(resource)
            var args = resource.name ? [resource.name] : []
            web.resource.apply(null, args.concat([resource.path, resource.fn]))
          })

          web.find = function(uri) {
            return routes.match(uri)
          }

          onload(web)
        })

      }
    }
  }
)
  
