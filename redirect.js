define(
  []
  , function() {
    return function(location) {
      return {
        statusCode : 302
      , headers : {
          location : location
        }
      }
    }
  }
)
  