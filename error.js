define(
  []
  , function() {
    return function(code, body) {
      return {
        statusCode : code
      , body : body
      }
    }
  }
)
  