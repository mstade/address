define(function (require) {
  // define these here so at least they only have to be
  // compiled once on the first module load.
  var _ = require('underscore')
    , serialize = require('./serialize')
    , encode = encodeURIComponent
    , decode = decodeURIComponent
    , serializeEncoder = _.compose(stringifyPrimitive, encode)

  return function(url) {
    var api = {
          query: setQuery
        , search: setSearch
        , path: setPath
        , pathname: getterSetter('pathname')
        , hash: getterSetter('hash')
        , toString: build
        }
      , fragments = {
          pathname: ''
        , path: ''
        , query: {}
        , hash: ''
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

    function setSearch(queryString) {
      if (!arguments.length) return serialize(fragments.query, serializeEncoder)
      fragments.query = parseQueryString(queryString.charAt(0) === '?'
        ? queryString.slice(1)
        : queryString
      )
      return api
    }

    function setPath(url) {
      return !arguments.length ? build() : parse(url)
    }

    function build() {
      var pathname = fragments.pathname || ''
        , hash = fragments.hash || ''
        , search = setSearch()

      if (hash && hash.charAt(0) !== '#') hash = '#' + hash

      pathname = pathname.replace(/[?#]/g, function(match) {
        return encode(match)
      })
      search = search.replace('#', '%23')

      return pathname + search + hash
    }

    function parse(url) {
      var parts = url.match(/^(.*?)(\?.*?)?(#.*?)?$/)
        , search = parts[2] ? parts[2].slice(1) : ''

      fragments.path = url
      fragments.pathname = parts[1] || ''
      fragments.hash = parts[3] ? parts[3].slice(1) : ''

      return setSearch(search)
    }
  }

  function parseQueryString(qs) {
    var sep = '&'
      , eq = '='
      , obj = {}
      , regexp = /\+/g
      , maxKeys = 1000
      , key, value, decodedKey, decodedValue, fragment, idx

    if (typeof qs !== 'string' || qs.length === 0) {
      return obj
    }

    var queryFragments = qs.split(sep)
      , len = Math.min(queryFragments.length, maxKeys)

    for (var i = 0; i < len; ++i) {
      fragment = queryFragments[i].replace(regexp, '%20')
      idx = fragment.indexOf(eq)

      if (idx !== -1) {
        key = fragment.substr(0, idx)
        value = fragment.substr(idx + 1)
      } else {
        key = fragment
        value = ''
      }

      decodedKey = decode(key)
      decodedValue = decode(value)

      if (!Object.prototype.hasOwnProperty.call(obj, decodedKey)) {
        obj[decodedKey] = decodedValue
      } else if (_.isArray(obj[decodedKey])) {
        obj[decodedKey].push(decodedValue)
      } else {
        obj[decodedKey] = [obj[decodedKey], decodedValue]
      }
    }

    return obj
  }

  function stringifyPrimitive(value) {
    switch (typeof value) {
      case 'string':
      case 'boolean':
        return String(value)

      case 'number':
        return isFinite(value) ? String(value) : ''

      default:
        return ''
    }
  }
})