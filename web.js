define(
  [ './parser' 
  , 'text!./resource.json'
  ]
, function(parser, resources) {
    return parser(resources)
  }
)
  
