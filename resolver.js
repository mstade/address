define(
  []
  , function() {

    return function (dep) {
      return function(req, res) {
        var scope = this
        require([dep], function(fn) {
          fn.call(scope, req, res)
        })
      }
    }
  }
)
  