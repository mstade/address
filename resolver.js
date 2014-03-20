define(
  []
  , function() {

    return function (dep) {
      return function(req, res) {
        var scope = this
        require([dep], function(fn) {
          fn = fn[req.method] || fn
          fn.call(scope, req, res)
        })
      }
    }
  }
)
  