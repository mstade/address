define(
  [ 'nap'
  , './parser' 
  , './middleware'
  , 'd3'
  , 'type/type'
  ]
, function(nap, parser, middleware, d3, type) {

    var web

    return {
      load: function (name, req, onload, config) {

        if (config.isBuild) {
          onload()
          return
        }

        web = nap.web().use(middleware.requestTimeout)

        d3.json("/api/apps/v1/resources", function(err, data) {

          if(err || !data.resources || !type.isArray(data.resources)) {
            //log.error("Failed to retrieve resources")
            data = { resources : [] }
          }

          var resources = parser.parseResources(data.resources)

          resources.forEach(function(resource) {
            var args = resource.name ? [resource.name] : []
            web.resource.apply(null, args.concat([resource.path, resource.fn]))
          })

          onload(web)
        })

      }
    }
  }
)
  
