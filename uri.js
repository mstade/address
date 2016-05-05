define(function (require) {
  var _ = require('underscore')
    , serialize = require('./serialize')
    , encode = encodeURIComponent
    , decode = decodeURIComponent
    , serializeEncoder = _.compose(String, encode)

  return function(url) {
    var api = {
          query: setQuery
        , search: setSearch
        , path: setPath
        , pathname: setPathname
        , hash: setHash
        , toString: build
        }
      , pathname = ''
      , query = {}
      , hash = ''

    return url ? parse(url) : api

    function setQuery(value) {
      if (!arguments.length) return query
      if (!_.isObject(value)) return query[value]
      query = _.extend(query, value)
      return api
    }

    function setPathname(value) {
      if (!arguments.length) return pathname
      pathname = value
      return api
    }

    function setHash(value) {
      if (!arguments.length) return hash
      hash = value
      return api
    }

    function setSearch(queryString) {
      if (!arguments.length) return serialize(query, serializeEncoder)
      query = parseQueryString(queryString.charAt(0) === '?'
        ? queryString.slice(1)
        : queryString
      )
      return api
    }

    function setPath(url) {
      return !arguments.length ? build() : parse(url)
    }

    function build() {
      var currentPathname = pathname.replace(/[?#]/g, function(match) {
            return encode(match)
          })
        , currentHash = hash && hash.charAt(0) !== '#' ? '#' + hash : hash
        , search = setSearch()

      search = search.replace('#', '%23')

      return currentPathname + search + currentHash
    }

    function parse(url) {
      var parts = url.match(/^(.*?)(\?.*?)?(#.*?)?$/)
        , search = parts[2] ? parts[2].slice(1) : ''

      pathname = parts[1] || ''
      hash = parts[3] ? parts[3].slice(1) : ''

      return setSearch(search)
    }
  }

  function parseQueryString(queryString) {
    var sep = '&'
      , eq = '='
      , query = {}
      , regexp = /\+/g
      , decodedKey, decodedValue, fragment, parts

    if (!queryString) return query

    var queryFragments = queryString.split(sep)
      , len = queryFragments.length

    for (var i = 0; i < len; ++i) {
      fragment = queryFragments[i].replace(regexp, '%20')
      parts = fragment.split(eq)
      decodedKey = decode(parts.shift())
      decodedValue = decode(parts.join(eq))

      if (!Object.prototype.hasOwnProperty.call(query, decodedKey)) {
        query[decodedKey] = decodedValue
      } else if (_.isArray(query[decodedKey])) {
        query[decodedKey].push(decodedValue)
      } else {
        query[decodedKey] = [query[decodedKey], decodedValue]
      }
    }

    return query
  }
})