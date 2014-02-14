define(
  [ './parser' 
  , 'text!./resource.json'
  ]
, function(parser, resources) {

    return {

      load: function (name, req, onload, config) {

        if (config.isBuild) {
          onload()
          return
        }

        if(err) {
          onload(err)
          return
        }

        var web = parser(resources)
        onload(web)
      }

    }
  }
)
  
