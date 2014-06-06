define(
  [ 'logger/log!platform/am-address'
  ]
  , function(log) {

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

       // if(!log.isDebug()) return next(req, res)

        next(req, function(err, data) {
          if(data.statusCode == 302) log.debug(data.statusCode, req.uri, data.headers.location)
          if(data.statusCode >= 400) {
            var args = [data.statusCode, req.uri, req.method]
            data.body && args.concat(data.body)
            log.debug.apply(log, args)
          }
          res(err, data)
        })
      }
    }

  }
)

  