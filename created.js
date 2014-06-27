define(
  []
  , function() {
    return function(location) {
      return {
        statusCode : 201
      , headers : {
          location : location
        }
      }
    }
  }
)
  