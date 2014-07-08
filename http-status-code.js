define(
  [ "underscore" ]
, function(_) {
    var map = {
          "100": ["continue", "informational"]
        , "101": ["switching-protocols", "informational"]
        , "200": ["ok", "successful"]
        , "201": ["created", "successful"]
        , "202": ["accepted", "successful"]
        , "203": ["non-authoritative-information", "successful"]
        , "204": ["no-content", "successful"]
        , "205": ["reset-content", "successful"]
        , "206": ["partial-content", "successful"]
        , "300": ["multiple-choices", "redirection"]
        , "301": ["moved-permanently", "redirection"]
        , "302": ["found", "redirection"]
        , "303": ["see-other", "redirection"]
        , "304": ["not-modified", "redirection"]
        , "305": ["use-proxy", "redirection"]
        , "306": ["-unused-", "redirection"]
        , "307": ["temporary-redirect", "redirection"]
        , "400": ["bad-request", "client-error"]
        , "401": ["unauthorized", "client-error"]
        , "402": ["payment-required", "client-error"]
        , "403": ["forbidden", "client-error"]
        , "404": ["not-found", "client-error"]
        , "405": ["method-not-allowed", "client-error"]
        , "406": ["not-acceptable", "client-error"]
        , "407": ["proxy-authentication-required", "client-error"]
        , "408": ["request-timeout", "client-error"]
        , "409": ["conflict", "client-error"]
        , "410": ["gone", "client-error"]
        , "411": ["length-required", "client-error"]
        , "412": ["precondition-failed", "client-error"]
        , "413": ["request-entity-too-large", "client-error"]
        , "414": ["request-uri-too-long", "client-error"]
        , "415": ["unsupported-media-type", "client-error"]
        , "416": ["requested-range-not-satisfiable", "client-error"]
        , "417": ["expectation-failed", "client-error"]
        , "500": ["internal-server-error", "server-error"]
        , "501": ["not-implemented", "server-error"]
        , "502": ["bad-gateway", "server-error"]
        , "503": ["service-unavailable", "server-error"]
        , "504": ["gateway-timeout", "server-error"]
        , "505": ["http-version-not-supported", "server-error"]
        }
      , values = _.uniq(_.flatten(_.values(map)))

    function codes(status) {
      return map[String(status)] || []
    }

    codes.range = function() {
      return values.slice()
    }

    return codes
  }
)
