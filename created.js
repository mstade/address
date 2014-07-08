define(
  []
  , function() {
    return function(location, body) {
      return {
        statusCode : 201
      , body : body
      , headers : {
          location : location
        }
      }
    }
  }
)
  