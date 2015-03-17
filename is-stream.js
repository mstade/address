define(
  []
, function() {

    var streamTypes = {
      "application/x.zap.stream" : true
    , "application/x.am.stream" : true
    }

    return function(res) {
      if(!res.headers.contentType) return
      return !!streamTypes[res.headers.contentType]
    }
  
  }
)