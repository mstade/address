define(
  [ 'd3'
  , './parser' 
  , 'text!./resource.json'
  ]
, function(d3, parser, resources) {

    return {

      load: function (name, req, onload, config) {

        if (config.isBuild) {
          onload()
          return
        }

        var web = parser(resources)
        onload(web)
      }

    }
  }
)
  