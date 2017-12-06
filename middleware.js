define(function(require) {

  var error = require('./error')
    , uri = require('./uri')
    , _ = require('underscore')

  return {

    requestTimeout : function(req, res, next) {
      var responded
        , timeout = setTimeout(function() {
            responded = true
            res(null, error(408))
          }, req.timeout)

      next(req, function(err, data) {
        clearTimeout(timeout)
        !responded && res(err, data)
      })
    }
  , decodeParams : function(req, res, next) {
      if (req.params) {
        req.params = _.mapObject(req.params, uri.decode)
      }
      next(req, res)
    }

  , logger : function(log) {
      return function logger(req, res, next) {
        next(req, function(err, data) {
          if(data.statusCode == 302) log.debug(data.statusCode, req.uri, data.headers.location)
          if(data.statusCode >= 400) {
            log.debug(data.statusCode, 'address failed to load resource:', req.uri, req.method, data.body || '')
          }
          res(err, data)
        })
      }
    }
  }
})

