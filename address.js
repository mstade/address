define(
  [ './web!'
  ]
  , function(web) {

    return function(r) {
      return {
        then : function(cb) {
          web.req(r, cb)
        }
      , into : function(node) {
          web.req(r, nap.into(node))
        }
      }
    }
  }
)