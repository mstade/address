define(
  []
  , function() {
    return function(code, body, headers) {
      return {
        statusCode : code
      , headers : headers || {}
      , body : body
      }
    }
  }
)