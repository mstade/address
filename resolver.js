define(
  [
  ]
  , function() {

    return {

      resolve : function (dep) {
        return function(req, res) {
          var scope = this
          require([dep], function(fn) {
            fn.call(scope, req, res)
          })
        }
      }

    , resolveView : function(dep) {
        return function(res) {
          var scope = this
          require([dep], function(fn) {
            fn.call(scope, res)
          })
        }
      }

    }
  }
)
  