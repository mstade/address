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
  
  return function(url) {
    var api = {
          query: setQuery
        , port: getterSetter('port')
        , protocol: getterSetter('protocol')
        , host: getterSetter('host')
        , auth: getterSetter('auth')
        , path: getterSetter('pathname')
        , hash: getterSetter('hash')
        , build: build
        }
      , fragments = {
          protocol: null
        , pathname: ''
        , path: ''
        , auth: ''
        , hostname: null
        , host: null
        , port: null
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
      var auth = fragments.auth || ''
        , protocol = fragments.protocol || ''
        , pathname = fragments.pathname || ''
        , hash = fragments.hash || ''
        , host = false
        , query = ''

      if (auth) {
        auth = encodeURIComponent(auth)
        auth = auth.replace(/%3A/i, ':')
        auth += '@'
      }

      if (fragments.host) {
        host = auth + fragments.host
      } else if (fragments.hostname) {
        host = auth + (fragments.hostname.indexOf(':') === -1
          ? fragments.hostname
          : '[' + fragments.hostname + ']')
        if (fragments.port) {
          host += ':' + fragments.port
        }
      }

      if (Object.keys(fragments.query).length) {
        query = formatQueryString(fragments.query)
      }

      var search = (query && ('?' + query)) || ''

      if (protocol && protocol.substr(-1) !== ':') protocol += ':'

      // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
      // unless they had them to begin with.
      if (fragments.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
        host = '//' + (host || '')
        if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname
      } else if (!host) {
        host = ''
      }

      if (hash && hash.charAt(0) !== '#') hash = '#' + hash
      if (search && search.charAt(0) !== '?') search = '?' + search

      pathname = pathname.replace(/[?#]/g, function(match) {
        return encodeURIComponent(match)
      })
      search = search.replace('#', '%23')

      return protocol + host + pathname + search + hash
    }

    function parse(url) {
      // Copy chrome, IE, opera backslash-handling behavior.
      // Back slashes before the query string get converted to forward slashes
      // See: https://code.google.com/p/chromium/issues/detail?id=25916
      var hasHash = false
        , start = -1
        , end = -1
        , rest = ''
        , lastPos = 0
        , i = 0
        , lowerProto = ''
        , code
      for (var inWs = false, split = false; i < url.length; ++i) {
        code = url.charCodeAt(i)

        // Find first and last non-whitespace characters for trimming
        var isWs = code === 32/* */ ||
          code === 9/*\t*/ ||
          code === 13/*\r*/ ||
          code === 10/*\n*/ ||
          code === 12/*\f*/ ||
          code === 160/*\u00A0*/ ||
          code === 65279/*\uFEFF*/
        if (start === -1) {
          if (isWs)
            continue
          lastPos = start = i
        } else {
          if (inWs) {
            if (!isWs) {
              end = -1
              inWs = false
            }
          } else if (isWs) {
            end = i
            inWs = true
          }
        }

        // Only convert backslashes while we haven't seen a split character
        if (!split) {
          switch (code) {
            case 35: // '#'
              hasHash = true
            // Fall through
            case 63: // '?'
              split = true
              break
            case 92: // '\\'
              if (i - lastPos > 0)
                rest += url.slice(lastPos, i)
              rest += '/'
              lastPos = i + 1
              break
          }
        } else if (!hasHash && code === 35/*#*/) {
          hasHash = true
        }
      }

      // Check if string was non-empty (including strings with only whitespace)
      if (start !== -1) {
        if (lastPos === start) {
          // We didn't convert any backslashes

          if (end === -1) {
            if (start === 0)
              rest = url
            else
              rest = url.slice(start)
          } else {
            rest = url.slice(start, end)
          }
        } else if (end === -1 && lastPos < url.length) {
          // We converted some backslashes and have only part of the entire string
          rest += url.slice(lastPos)
        } else if (end !== -1 && lastPos < end) {
          // We converted some backslashes and have only part of the entire string
          rest += url.slice(lastPos, end)
        }
      }

      if (!hasHash) {
        // Try fast path regexp
        var simplePath = simplePathPattern.exec(rest)
        if (simplePath) {
          fragments.path = rest
          fragments.href = rest
          fragments.pathname = simplePath[1]
          if (simplePath[2]) {
            fragments.search = simplePath[2]
            fragments.query = parseQueryString(fragments.search.slice(1))
          }
          return api
        }
      }

      var proto = protocolPattern.exec(rest)
      if (proto) {
        proto = proto[0]
        lowerProto = proto.toLowerCase()
        fragments.protocol = lowerProto
        rest = rest.slice(proto.length)
      }

      // figure out if it's got a host
      // user@server is *always* interpreted as a hostname, and url
      // resolution will treat //foo/bar as host=foo,path=bar because that's
      // how the browser resolves relative URLs.
      if (proto || /^\/\/[^@\/]+@[^@\/]+/.test(rest)) {
        var slashes = rest.charCodeAt(0) === 47/*/*/ &&
        rest.charCodeAt(1) === 47/*/*/
        if (slashes && !proto) {
          rest = rest.slice(2)
          fragments.slashes = true
        }
      }

      if ((slashes || (proto && !slashedProtocol[proto]))) {

        // there's a hostname.
        // the first instance of /, ?, ;, or # ends the host.
        //
        // If there is an @ in the hostname, then non-host chars *are* allowed
        // to the left of the last @ sign, unless some host-ending character
        // comes *before* the @-sign.
        // URLs are obnoxious.
        //
        // ex:
        // http://a@b@c/ => user:a@b host:c
        // http://a@b?@c => user:a host:b path:/?@c

        // v0.12 TODO(isaacs): This is not quite how Chrome does things.
        // Review our test case against browsers more comprehensively.

        var hostEnd = -1
        var atSign = -1
        var nonHost = -1
        for (i = 0; i < rest.length; ++i) {
          switch (rest.charCodeAt(i)) {
            case 9:   // '\t'
            case 10:  // '\n'
            case 13:  // '\r'
            case 32:  // ' '
            case 34:  // '"'
            case 37:  // '%'
            case 39:  // '\''
            case 59:  // ';'
            case 60:  // '<'
            case 62:  // '>'
            case 92:  // '\\'
            case 94:  // '^'
            case 96:  // '`'
            case 123: // '{'
            case 124: // '|'
            case 125: // '}'
                      // Characters that are never ever allowed in a hostname from RFC 2396
              if (nonHost === -1)
                nonHost = i
              break
            case 35: // '#'
            case 47: // '/'
            case 63: // '?'
              // Find the first instance of any host-ending characters
              if (nonHost === -1)
                nonHost = i
              hostEnd = i
              break
            case 64: // '@'
              // At this point, either we have an explicit point where the
              // auth portion cannot go past, or the last @ char is the decider.
              atSign = i
              nonHost = -1
              break
          }
          if (hostEnd !== -1)
            break
        }
        start = 0
        if (atSign !== -1) {
          fragments.auth = decodeURIComponent(rest.slice(0, atSign))
          start = atSign + 1
        }
        if (nonHost === -1) {
          fragments.host = rest.slice(start)
          rest = ''
        } else {
          fragments.host = rest.slice(start, nonHost)
          rest = rest.slice(nonHost)
        }

        // pull out port.
        parseHost(fragments)

        // we've indicated that there is a hostname,
        // so even if it's empty, it has to be present.
        if (typeof fragments.hostname !== 'string')
          fragments.hostname = ''

        var hostname = fragments.hostname

        // if hostname begins with [ and ends with ]
        // assume that it's an IPv6 address.
        var ipv6Hostname = hostname.charCodeAt(0) === 91/*[*/ &&
        hostname.charCodeAt(hostname.length - 1) === 93/*]*/

        // validate a little.
        if (!ipv6Hostname) {
          rest = validateHostname(fragments, rest, hostname) || rest
        }

        if (fragments.hostname.length > hostnameMaxLen) {
          fragments.hostname = ''
        } else {
          // hostnames are always lower case.
          fragments.hostname = fragments.hostname.toLowerCase()
        }

        if (!ipv6Hostname) {
          // IDNA Support: Returns a punycoded representation of "domain".
          // It only converts parts of the domain name that
          // have non-ASCII characters, i.e. it doesn't matter if
          // you call it with a domain that already is ASCII-only.
          fragments.hostname = punycode.toASCII(fragments.hostname)
        }

        var p = fragments.port ? ':' + fragments.port : ''
        var h = fragments.hostname || ''
        fragments.host = h + p

        // strip [ and ] from the hostname
        // the host field still retains them, though
        if (ipv6Hostname) {
          fragments.hostname = fragments.hostname.slice(1, -1)
          if (rest[0] !== '/') {
            rest = '/' + rest
          }
        }
      }

      // now rest is set to the post-host stuff.
      // chop off any delim chars.

      // First, make 100% sure that any "autoEscape" chars get
      // escaped, even if encodeURIComponent doesn't think they
      // need to be.
      var result = autoEscapeStr(rest)
      if (result !== undefined)
        rest = result

      var questionIdx = -1
      var hashIdx = -1
      for (i = 0; i < rest.length; ++i) {
        code = rest.charCodeAt(i)
        if (code === 35/*#*/) {
          fragments.hash = rest.slice(i)
          hashIdx = i
          break
        } else if (code === 63/*?*/ && questionIdx === -1) {
          questionIdx = i
        }
      }

      if (questionIdx !== -1) {
        if (hashIdx === -1) {
          fragments.search = rest.slice(questionIdx)
          fragments.query = rest.slice(questionIdx + 1)
        } else {
          fragments.search = rest.slice(questionIdx, hashIdx)
          fragments.query = rest.slice(questionIdx + 1, hashIdx)
        }
        fragments.query = parseQueryString(fragments.query)
      }

      var firstIdx = (questionIdx !== -1 &&
        (hashIdx === -1 || questionIdx < hashIdx)
          ? questionIdx
          : hashIdx)
      if (firstIdx === -1) {
        if (rest.length > 0)
          fragments.pathname = rest
      } else if (firstIdx > 0) {
        fragments.pathname = rest.slice(0, firstIdx)
      }
      if (slashedProtocol[lowerProto] && fragments.hostname && !fragments.pathname) {
        fragments.pathname = '/'
      }

      // to support http.request
      if (fragments.pathname || fragments.search) {
        fragments.path = (fragments.pathname || '') + (fragments.search || '')
      }
      
      return api
    }
  }

  function validateHostname(fragments, rest, hostname) {
    for (var i = 0, lastPos = 0; i <= hostname.length; ++i) {
      var code
      if (i < hostname.length)
        code = hostname.charCodeAt(i)
      if (code === 46/*.*/ || i === hostname.length) {
        if (i - lastPos > 0) {
          if (i - lastPos > 63) {
            self.hostname = hostname.slice(0, lastPos + 63)
            return '/' + hostname.slice(lastPos + 63) + rest
          }
        }
        lastPos = i + 1
        continue
      } else if ((code >= 48/*0*/ && code <= 57/*9*/) ||
        (code >= 97/*a*/ && code <= 122/*z*/) ||
        code === 45/*-*/ ||
        (code >= 65/*A*/ && code <= 90/*Z*/) ||
        code === 43/*+*/ ||
        code === 95/*_*/ ||
        code > 127) {
        continue
      }
      // Invalid host character
      fragments.hostname = hostname.slice(0, i)
      if (i < hostname.length)
        return '/' + hostname.slice(i) + rest
      break
    }
  }

  function parseHost(fragments) {
    var host = fragments.host
      , port = portPattern.exec(host)
    if (port) {
      port = port[0]
      if (port !== ':') {
        fragments.port = port.slice(1)
      }
      host = host.slice(0, host.length - port.length)
    }
    if (host) fragments.hostname = host
  }

  function autoEscapeStr(rest) {
    var newRest = ''
      , lastPos = 0
    for (var i = 0; i < rest.length; ++i) {
      // Automatically escape all delimiters and unwise characters from RFC 2396
      // Also escape single quotes in case of an XSS attack
      switch (rest.charCodeAt(i)) {
        case 9:   // '\t'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%09'
          lastPos = i + 1
          break
        case 10:  // '\n'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%0A'
          lastPos = i + 1
          break
        case 13:  // '\r'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%0D'
          lastPos = i + 1
          break
        case 32:  // ' '
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%20'
          lastPos = i + 1
          break
        case 34:  // '"'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%22'
          lastPos = i + 1
          break
        case 39:  // '\''
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%27'
          lastPos = i + 1
          break
        case 60:  // '<'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%3C'
          lastPos = i + 1
          break
        case 62:  // '>'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%3E'
          lastPos = i + 1
          break
        case 92:  // '\\'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%5C'
          lastPos = i + 1
          break
        case 94:  // '^'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%5E'
          lastPos = i + 1
          break
        case 96:  // '`'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%60'
          lastPos = i + 1
          break
        case 123: // '{'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%7B'
          lastPos = i + 1
          break
        case 124: // '|'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%7C'
          lastPos = i + 1
          break
        case 125: // '}'
          if (i - lastPos > 0) newRest += rest.slice(lastPos, i)
          newRest += '%7D'
          lastPos = i + 1
          break
      }
    }
    if (lastPos === 0) return
    if (lastPos < rest.length) return newRest + rest.slice(lastPos)
    else return newRest
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

      k = decodeURIComponent(kstr)
      v = decodeURIComponent(vstr)

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
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq
      if (_.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v))
        }).join(sep)
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]))
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