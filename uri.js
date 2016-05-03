define(function (require) {
  // define these here so at least they only have to be
  // compiled once on the first module load.
  var protocolPattern = /^([a-z0-9.+-]+:)/i
    , portPattern = /:[0-9]*$/

    // Special case for a simple path URL
    , simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/

    , hostnameMaxLen = 255
    // protocols that always contain a // bit.
    , slashedProtocol = {
        'http': true
      , 'http:': true
      , 'https': true
      , 'https:': true
      , 'ftp': true
      , 'ftp:': true
      , 'gopher': true
      , 'gopher:': true
      , 'file': true
      , 'file:': true
      }
    , _ = require('underscore')
    , encode = encodeURIComponent
    , decode = decodeURIComponent

  return function(url) {
    var api = {
          query: setQuery
        , path: getterSetter('pathname')
        , hash: getterSetter('hash')
        , build: build
        }
      , fragments = {
          pathname: ''
        , path: ''
        , auth: ''
        , query: {}
        , hash: ''
        , search: ''
        }

    return url ? parse(url) : api

    function setQuery(value) {
      if (!arguments.length) return fragments.query
      if (!_.isObject(value)) return fragments.query[value]
      fragments.query = _.extend(fragments.query, value)
      return api
    }

    function getterSetter(prop) {
      return function _getterSetter(value) {
        if (!arguments.length) return fragments[prop]
        fragments[prop] = value
        return api
      }
    }

    function build() {
      var pathname = fragments.pathname || ''
        , hash = fragments.hash || ''
        , query = ''

      if (Object.keys(fragments.query).length) {
        query = formatQueryString(fragments.query)
      }

      var search = (query && ('?' + query)) || ''

      if (hash && hash.charAt(0) !== '#') hash = '#' + hash
      if (search && search.charAt(0) !== '?') search = '?' + search

      pathname = pathname.replace(/[?#]/g, function(match) {
        return encode(match)
      })
      search = search.replace('#', '%23')

      return pathname + search + hash
    }

    function parse(url) {
      var parts = url.match(/^(.*?)(\?.*?)?(#.*?)?$/)
      fragments.path = url
      fragments.pathname = parts[1] || '/'
      fragments.search = parts[2] ? parts[2].slice(1) : ''
      fragments.query = parseQueryString(fragments.search)
      fragments.hash = parts[3] ? parts[3].slice(1) : ''

      return api
    }
  }

  function parseQueryString(qs) {
    var sep = '&'
      , eq = '='
      , obj = {}
      , regexp = /\+/g
      , maxKeys = 1000

    if (typeof qs !== 'string' || qs.length === 0) {
      return obj
    }

    var queryFragments = qs.split(sep)

    var len = queryFragments.length
    // maxKeys <= 0 means that we should not limit keys count
    if (maxKeys > 0 && len > maxKeys) {
      len = maxKeys
    }

    for (var i = 0; i < len; ++i) {
      var x = queryFragments[i].replace(regexp, '%20'),
          idx = x.indexOf(eq),
          kstr, vstr, k, v

      if (idx >= 0) {
        kstr = x.substr(0, idx)
        vstr = x.substr(idx + 1)
      } else {
        kstr = x
        vstr = ''
      }

      k = decode(kstr)
      v = decode(vstr)

      if (!Object.prototype.hasOwnProperty.call(obj, k)) {
        obj[k] = v
      } else if (_.isArray(obj[k])) {
        obj[k].push(v)
      } else {
        obj[k] = [obj[k], v]
      }
    }

    return obj
  }

  function formatQueryString(obj) {
    var sep = '&'
      , eq = '='

    return Object.keys(obj).map(function(k) {
      var ks = encode(stringifyPrimitive(k)) + eq
      if (_.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encode(stringifyPrimitive(v))
        }).join(sep)
      } else {
        return ks + encode(stringifyPrimitive(obj[k]))
      }
    }).join(sep)
  }

  function stringifyPrimitive(v) {
    switch (typeof v) {
      case 'string':
        return v

      case 'boolean':
        return v ? 'true' : 'false'

      case 'number':
        return isFinite(v) ? v : ''

      default:
        return ''
    }
  }
})