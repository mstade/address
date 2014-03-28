define(
  []
  , function() {

    function isFn(inst){
      return typeof inst === "function"
    }

    return function (dep) {
      return function(req, res) {
        var scope = this
        require([dep], function(fn) {
          fn = fn[req.method] || fn

          if(!isFn(fn)) {
            console.debug("failed to resolve resource function from module", dep, req.method)
            return
          }

          fn.call(scope, req, res)
        })
      }
    }
  }
)
  