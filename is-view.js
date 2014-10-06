define(
  []
, function() {

    var viewTypes = { 
      "application/x.nap.view" : true
    , "application/x.am.app" : true
    }

    return function(res) {
      if(!res.headers.contentType) return
      return !!viewTypes[res.headers.contentType]
    }
  
  }
)