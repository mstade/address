define(
  [ 'nap'
  , './resolver'
  ]
  , function(nap, resolve) {

    function isFn(inst){
      return typeof inst === "function"
    }

    function isStr(inst){
      return typeof inst === "string"
    }


    function bySelectorDefered(options){

      options = options.map(function(item) {
        return Object.keys(item).reduce(function(_, k) { 
          return { selector: k, fn: resolve(item[k]) } 
        }, {}) 
      })

      return function(node){

        var fn

        options.some(function(option){
          if(nap.is(node, option.selector)) {
            fn = option.fn
            return true
          }
        })

        return fn
      }
    }

    function negotiateSelector(args) {

      var defered = bySelectorDefered(args)

      return function(req, res) {
        res(
          null
        , nap.responses.ok(function(node) {
            defered.call(null, node)(req, function(err, data) {
              if(!isFn(data.body)) {
                console.debug("response body is not a function:", req.uri, req.method, req.headers.accept)
                return
              }
              data.body(node)
            })
          })
        )
      }
    }

    function parseLevel(level, levelParser) {

      if(isStr(level)) return resolve(level)

      Object.keys(level).forEach(function(key) {
        if(isStr(level[key])) {
          level[key] = resolve(level[key])
        } else {
          level[key] = levelParser(level[key])
        }
      })

      return level
    }

    function parseMethods(obj) {
      obj = parseLevel(obj, parseMediaTypes)
      return nap.negotiate.method(obj)
    }

    function parseMediaTypes(obj) {
      obj = parseLevel(obj, parseSelectors)
      return nap.negotiate.accept(obj)
    }

    function parseSelectors(obj) {
      if(isStr(obj)) return resolve(obj)
      return negotiateSelector(obj)
    }

    function parseResources(config) {

      var parsed = isStr(config) ? JSON.parse(config) : config

      parsed.forEach(function(resource) {
        resource.fn = parseLevel({fn: resource.methods}, parseMethods).fn
      })
      
      return parsed
    }

    return {
      parseMethods    : parseMethods
    , parseMediaTypes : parseMediaTypes
    , parseSelectors  : parseSelectors
    , parseResources  : parseResources
    }
  }
)