define(
  [ 'logger/log!platform/am-address'
  ]
  , function(log) {

    function isFn(inst){
      return typeof inst === "function"
    }

    return function (dep) {

      return function(req, res) {

        require([dep], function(fn) {

          fn = fn[req.method] || fn

          if(!isFn(fn)) {
            log.debug("failed to resolve resource function from module", dep, req.method)
            return
          }

          fn.call(null, req, res)
        })
      }

    }
  }
)
  