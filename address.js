define(
  [ 'nap'
  , './web'
  ]
  , function(nap, web) {

    function address(r) {
      return {
        path : function() {
          return r
        }
      , then : function(cb) {
          web.req(r, cb)
        }
      , into : function(node) {
          web.req(r, nap.into(node))
        }
      }
    }

    address.resource = function(name) {
      return web.resource(name)
    }

    return address
  }
)