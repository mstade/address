define(function(require) {
  return {
    address: require('./address')
  , response: require('./response')
  , ok: require('./ok')
  , error: require('./error')
  , redirect: require('./redirect')
  , into: require('./into')
  , httpStatusCode: require('./http-status-code')
  , stream: require('./stream')
  }
})
