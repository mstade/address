define(
  [ 'logger/log!platform/am-address'
  , 'underscore'
  ]
  , function(log, _) {

    return function (dep) {

      return function(req, res) {

        require([dep], callHandler)

        function callHandler (module) {
          var fn = module[req.method] || (_.isFunction(module) ? module : module.default)

          if(!_.isFunction(fn)) {
            log.debug("failed to resolve resource function from module", dep, req.method)
            return
          }

          fn.call(null, req, function() {
            if(arguments.length == 1) return res.call(null, null, arguments[0])
            res.apply(null, arguments)
          })
        }
      }

    }
  }
)

