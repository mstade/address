define(
  {
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
  }
)
  