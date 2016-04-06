define(
  []
, function() {

    var viewTypes = { 
      "application/x.nap.view" : true
    , "application/x.am.app" : true
    }

    return function(obj) {
      return (obj.headers && obj.headers.accept &&!!viewTypes[obj.headers.accept])
          || (obj.headers && obj.headers.contentType &&!!viewTypes[obj.headers.contentType])
    }
  }
)