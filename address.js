define(
  [ 'nap'
  , './web!'
  ]
  , function(nap, web) {

    return function(r) {
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
  }
)