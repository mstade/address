define(
  [ 'nap'
  , './parser' 
  , 'text!./resource.json'
  ]
, function(nap, parser, config) {

    var web = nap.web()
      , resources = parser.parseResources(config)

    resources.forEach(function(resource) {
      var args = resource.name ? [resource.name] : []
      web.resource.apply(null, args.concat([resource.path, resource.fn]))
    })

    return web
  }
)
  
