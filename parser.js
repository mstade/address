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

    function bySelectorDefered(){
      var options = [].slice.apply(arguments, [0])
        .reduce(
          function(curr, next){
            if(isStr(next)) curr.push({ selector : next })
            else curr[curr.length - 1].fn = next
            return curr
          }
        , []
        )
      
      return function(node){
        var fn
        options.some(function(option){
          if(is(node, option.selector)) {
            fn = option.fn
            return true
          }
        })
        return fn
      }
    }

    function negotiateSelector(args) {

      var defered = nap.negotiate.defered.apply(null, args)

      return function(req, res) {
        res(
          null
        , function(node) {
            defered.call(null, node)(req, function(err, view) {
              view(node)
            })
          }
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

      var args = []

      obj.forEach(function(def) {
        Object.keys(def).forEach(function(key) {
          def[key] = resolve(def[key])
          args.push(key)
          args.push(def[key])
        })
      })

      return negotiateSelector(args)
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