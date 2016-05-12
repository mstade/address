define(function(require) {
  var uri = require('./uri')
  return function(location) {
    return {
      statusCode : 302
    , headers : {
        location : uri(location, String).toString()
      }
    }
  }
})
  