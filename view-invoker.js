define(
  [ 'logger/log!platform/am-address'
  , 'type/type'
  ]
, function(log, type) {

    return function(res, node) {

      if(res.statusCode != 200) {
        log.debug('view resource returned non-200 status code. view function not invoked')
        return
      }

      if(!type.isFunction(res.body)) {
        log.debug('view resource returned non-function object in response body')
        return
      }

      res.body(node)
    }
  
  }
)