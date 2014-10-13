define(
  [ 'type/type'
  ]
, function(type) {

    return function(location) {

      return function(req, res) {

        if(type.isFunction(res.body)) {  
          var view = res.body
          res.body = function(node) {
            if(location.isRoot(node)) location.pushState(res.headers.location || req.uri)
            node.dispatchEvent && node.dispatchEvent(new CustomEvent("update", {detail : { from : node.__resource__, to : req.uri }}))
            node.__resource__ = req.uri
            view(node)
          }
        }
      }
    }
  }
)