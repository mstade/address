define(
  [ 'nap'
  ]
  , function(nap) {

    function isFn(inst){
      return typeof inst === "function"
    }

    function isStr(inst){
      return typeof inst === "string"
    }

    function resolve(dep) {
      return function(req, res) {
        var scope = this
        require([dep], function(fn) {
          fn.call(scope, req, res)
        })
      }
    }

    function resolveView(dep) {
      return function(res) {
        var scope = this
        require([dep], function(fn) {
          fn.call(scope, res)
        })
      }
    }

    function negotiateSelector(args) {
      return function(req, res) {
        res(
          null
        , nap.negotiate.selector.apply(null, args)
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
          def[key] = resolveView(def[key])
          args.push(key)
          args.push(def[key])
        })
      })

      return negotiateSelector(args)
    }

    return function(config) {

      var parsed = isStr(config) ? JSON.parse(config) : config

      parsed.forEach(function(resource) {
        resource.fn = parseLevel({methods: resource.methods}, parseMethods).methods
      })
      
      return parsed
    }
  }
)
  
