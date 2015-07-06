define(function(require) {

    var nap = require('nap')
      , resolve = require('./resolver')
      , error = require('./error')
      , _ = require('underscore')

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

        if(!req.context) {
          res(null, error(400, 'invalid target node'))
          return
        }

        var view = defered.call(null, req.context)

        if(!view) {
          res(null, error(404, 'no view found for selector'))
          return
        }

        view(req, res)
      }
    }

    function parseLevel(level, levelParser) {

      if(_.isString(level)) return resolve(level)

      Object.keys(level).forEach(function(key) {
        if(_.isString(level[key])) {
          level[key] = resolve(level[key])
        } else {
          level[key] = levelParser(level[key])
        }
      })

      return level
    }

    function parseMethods(obj) {
      obj = parseLevel(obj, parseMediaTypes)
      expand(obj)
      return nap.negotiate.method(obj)
    }

    function parseMediaTypes(obj) {
      obj = parseLevel(obj, parseSelectors)
      return nap.negotiate.accept(obj)
    }

    function parseSelectors(obj) {
      if(_.isString(obj)) return resolve(obj)
      return negotiateSelector(obj)
    }

    function expand(obj) {
      Object.keys(obj).forEach(function(key) {
        var multi = key.split(',')
        if(multi.length > 1) {
          key.split(',').forEach(function(k) {
            obj[k.trim()] = obj[key]
          })
          delete obj[key]
        }
      })
      return obj
    }

    function parseResources(config) {

      var parsed = _.isString(config) ? JSON.parse(config) : config

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
