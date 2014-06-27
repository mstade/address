define(
  []
  , function() {
    return function(code, body) {
      return {
        statusCode : code
      , headers : {}
      , body : body
      }
    }
  }
)
  