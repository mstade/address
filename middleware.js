define(
  [ 'logger/log!platform/am-address'
  , 'd3'
  , './location'
  , 'type/type'
  , './is-view'
  , 'underscore'
  ]
  , function(log, d3, createLocation, type, isView, _) {

    var location = createLocation()

    return {

      requestTimeout : function(req, res, next) {

        var responded
          , timeout = setTimeout(function() {
              responded = true
              res(null, nap.responses.error(408))
            }, 30000) 

        next(req, function(err, data) {
          clearTimeout(timeout)
          !responded && res(err, data)
        })
      }
      
    , logger : function(req, res, next) {

        //if(!log.isDebug()) return next(req, res)

        next(req, function(err, data) {
          if(data.statusCode == 302) log.debug(data.statusCode, req.uri, data.headers.location)
          if(data.statusCode >= 400) {
            var args = [data.statusCode, req.uri, req.method]
            data.body && (args = args.concat(data.body))
            log.debug.apply(log, args)
          }
          res(err, data)
        })
      }

    , view : function(req, res, next) {

        next(req, function(err, data) {

          if(!isView(data) || data.statusCode == 302) return res(err, data), null

          if(type.isFunction(data.body)) {  
            var view = data.body
            data.body = function(node) {
              if(location.isRoot(node)) location.pushState(data.headers.location || req.uri)
              node.dispatchEvent && node.dispatchEvent(new CustomEvent("update", {detail : { from : node.__resource__, to : req.uri }}))
              node.__resource__ = req.uri
              view(node)
            }
          }

          res(err, data)
        })
      }
    }
  }
)

  