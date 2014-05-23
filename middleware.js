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
          if(data.statusCode >= 400) log.debug(data.statusCode, req.uri, req.method)
          res(err, data)
        })
      }
    }

  }
)

  