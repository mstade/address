define(function(require) {
  return {
    address: require('./address')
  , created: require('./created')
  , error: require('./error')
  , httpStatusCode: require('./http-status-code')
  , interpolate: require('./interpolate')
  , into: require('./into')
  , location: require('./location')()
  , middleware: require('./middleware')
  , ok: require('./ok')
  , redirect: require('./redirect')
  , response: require('./response')
  , serialize: require('./serialize')
  , stream: require('./stream')
  }
})
