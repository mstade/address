define(
  [ 'nap'
  , './parser' 
  , './middleware'
  , 'd3'
  , 'type/type'
  ]
, function(nap, parser, middleware, d3, type) {

    var web = nap.web().use(middleware.requestTimeout)

    return {
      load: function (name, req, onload, config) {

        if (config.isBuild) {
          onload()
          return
        }

        d3.json("/api/apps/v1/resources", function(err, data) {

          if(err || !type.isArray(data)) {
           // log.error("Failed to retrieve resources")
            data = []
          }

          var resources = parser.parseResources(data)

          console.log("resources: " + resources)

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
  
