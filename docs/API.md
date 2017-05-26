# API

## TOC

* [Requesting a resource](#requesting-a-resource)
  + [`address(uri)`](#addressuri)
  + [`.uri()`](#uri)
  + [`.param()`](#param)
  + [`.query()`](#query)
  + [`.body()`](#body)
  + [`.origin()`](#origin)
  + [`.get()`](#get)
  + [`.post()`](#post)
  + [`.put()`](#put)
  + [`.remove()`](#remove)
  + [`.patch()`](#patch)
  + [`.method()`](#method)
  + [`.header()`](#header)
  + [`.json()`](#json)
  + [`.xml()`](#xml)
  + [`.text()`](#text)
* [Handling the response](#handling-the-response)
  + [`.on(RESPONSE TYPE, cb)`](#onresponse-type-cb)
  + [`.on(STATUS CODE NAME, cb)`](#onstatus-code-name-cb)
  + [`.on('done', cb)`](#ondone-cb)
  + [`.on('err', cb)`](#onerr-cb)
* [Building a resource](#building-a-resource)
  + [`req.body`](#reqbody)
  + [`req.headers`](#reqheaders)
  + [`req.method`](#reqmethod)
  + [`req.origin`](#reqorigin)
  + [`req.params`](#reqparams)
  + [`req.url`](#requrl)
  + [`res()`](#res)
  + [`response(STATUS CODE, BODY, HEADERS)`](#responsestatus-code-body-headers)
  + [`ok(BODY)`](#okbody)
  + [`error(ERROR CODE, BODY)`](#errorerror-code-body)
  + [`created(LOCATION, BODY)`](#createdlocation-body)
  + [`redirect(LOCATION)`](#redirectlocation)
* [Listening to a stream resource](#listening-to-a-stream-resource)
  + [`address.stream()`](#addressstream)
  + [`.on('status', cb)`](#onstatus-cb)
  + [`.on('message', cb)`](#onmessage-cb)
  + [`.on('error', cb)`](#onerror-cb)
* [Building a stream resource](#building-a-stream-resource)
  + [`stream()`](#stream)
  + [`resourceStream.on('firstsubscribed', cb)`](#resourcestreamonfirstsubscribed-cb)
  + [`resourceStream.on('lastunsubscribed', cb)`](#resourcestreamonlastunsubscribed-cb)
  + [`resourceStream()`](#resourcestream)
  + [`resourceStream.error()`](#resourcestreamerror)
  + [`resourceStream.message()`](#resourcestreammessage)
  + [`resourceStream.status()`](#resourcestreamstatus)
* [Requesting DOM view resource](#requesting-dom-view-resource)
  + [`address.view()`](#addressview)
  + [`address.app()`](#addressapp)
  + [`address.into()`](#addressinto)
* [Building DOM view resource](#building-dom-view-resource)
  + [`node.addEventListener('update', cb)`](#nodeaddeventlistenerupdate-cb)
  + [`node.addEventListener('resourcewillchange', cb)`](#nodeaddeventlistenerresourcewillchange-cb)
* [Top level navigation](#top-level-navigation)
  + [`.navigate()`](#navigate)
  + [`.target()`](#target)


## Requesting a resource

To request a resource, you will need to import the address module with the modules:

```javascript
// using ES6 modules
import { address } from '@zambezi/address'

// using AMD modules
define([
  '@zambezi/address/lib/address'
], function(address) {
  // ...
})
```

### `address(uri)`

Creates a resource request object, with an optional uri parameter, that is used to:

- provide additional request options - _headers and accept types_
- specify data with the request - _parameters, query strings, body_
- register listeners to response events
- initiate the request once all configuration has been done

```javascript
address('/price/usd/gbp')
  .on('ok', function(response) {
    // use data from response
  })
  .get()
```

### `.uri()`

Provides set or get of the resource uri to be requested.

_set:_
```javascript
address()
  .uri('/price/usd/gbp')
  .on('ok', function(response) {
    // use data from response
  })
  .get()
```

_get:_
```javascript
var value = address()
  .uri('/price/usd/gbp')
  .uri()
// value === '/price/usd/gbp'
```


### `.param()`

Provides set or get for path parameters, using key-value arguments or an object of key-value properties, which are interpolated into the path.

_set (key-value arguments):_
```javascript
address('/price/{ccy1}/{ccy2}')
  .param('ccy1', 'usd')
  .param('ccy2', 'gbp')
  .get()

// -> /price/usd/gbp
```

_set (object of key-value properties):_
```javascript
address('/price/{ccy1}/{ccy2}')
  .param({ ccy1: 'usd', ccy2: 'gbp' })
  .get()

// -> /price/usd/gbp
```

_get (object of key-value properties):_
```javascript
var value = address('/price/{ccy1}/{ccy2}')
  .param('ccy1', 'usd')
  .param('ccy2', 'gbp')
  .param()

// value === { ccy1: 'usd', ccy2: 'gbp' }
```

### `.query()`

Provides set or get for query parameters, using key-value arguments or an object of key-value properties, which will be appended to the path.

_set (key-value arguments):_
```javascript
address('/price/usd/gbp')
  .query('ccy1', 'usd')
  .query('ccy2', 'gbp')

// -> /price/usd/gbp?ccy1=usd&ccy2=gbp
```

_set (object of key-value properties):_
```javascript
address('/price/usd/gbp')
  .query({ ccy1: 'usd', ccy2: 'gbp' })

// -> /price/usd/gbp?ccy1=usd&ccy2=gbp
```

_get (object of key-value properties):_
```javascript
var value = address('/price/usd/gbp')
  .query('ccy1', 'usd')
  .query('ccy2', 'gbp')
  .query()

// value === { ccy1: 'usd', ccy2: 'gbp' }
```


### `.body()`

Provides set or get for the body of your request. This can be any object and will be accessible to the resource through the `request.body` property.


_set:_
```javascript
address('/price/usd/gbp')
  .body({ foo: 'bar' })
  .post()
```

_get:_
```javascript
var value = address('/price/usd/gbp')
  .body({ foo: 'bar' })
// value === { foo: 'bar' }
```

### `.origin()`

To disambiguate the DOM element used as the local root, when navigating or using DOM view resource, it is possible to specify an origin node when building a request.

The `origin` node provided should be a descendant of the root node in which the request should be resolved. In cases where the running application contains more than one possible root (for instance when running in browser workspaces), specifying an origin node allows address to navigate in the correct window.

_example: navigation with origin specified_
```javascript
address('/price/usd/gbp')
  .origin(node)
  .navigate()
```

_example: using DOM view resource with origin specified_
```javascript
address('/price/usd/gbp')
  .origin(node)
  .into()
  .get()
```

### `.get()`

Invoke the request using the [get method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html).

```javascript
address('/price/usd/gbp')
  .on('ok', function(response) {
    // use data from response
  })
  .get()
```

### `.post()`

Invoke the request using the [post method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html).

A payload can be passed in as a parameter, which will be equivalent to passing in a payload through [`.body()`](#body).

```javascript
address('/price/usd/gbp')
  .post({ foo: 'bar' })
```

### `.put()`

Invoke the request using the [put method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html).

A payload can be passed in as a parameter, which will be equivalent to passing in a payload through [`.body()`](#body).

```javascript
address('/price/usd/gbp')
  .put({ foo: 'bar' })
```

### `.remove()`

Invoke the request using the [remove method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html).

A payload can be passed in as a parameter, which will be equivalent to passing in a payload through [`.body()`](#body).

```javascript
address('/price/usd/gbp')
  .remove({ foo: 'bar' })
```

### `.patch()`

Invoke the request using the [patch method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html).

A payload can be passed in as a parameter, which will be equivalent to passing in a payload through [`.body()`](#body).

```javascript
address('/price/usd/gbp')
  .patch({ foo: 'bar' })
```

### `.method()`

Set method for the request, with invoking the request.

The method chosen should match the semantics found in the [standard HTTP verbs](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html)):

    GET
    POST
    PUT
    REMOVE
    PATCH

```javascript
address('/price/usd/gbp')
  .method('post')
  .body(someData)
  () // invoke request
```

### `.header()`

Allows headers to be added to a request, so that further information can be conveyed about how the request should be handled.

For example, resources may route requests to different handlers based on the `accept type` of the request.
Specify the `accept type` header using the `.header()` api.

```javascript
address('/price/usd/gbp')
  .header('accept-type', 'application/json')
  .on('ok', function(response) {
    // use data from response
  })
  .get()
```

Accept types must conform to the [HTTP field definition](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html)

The default accept type for requests is 'application/x.nap.view' which is the type for a view resource.

### `.json()`

A convenience methods for setting the accept type header to `'application/json'`:

```javascript
address('/price/usd/gbp')
  .json()
  .on('ok', function(response) {
    // use data from response
  })
  .get()
```

### `.xml()`

A convenience methods for setting the accept type header to `'text/xml'`:

```javascript
address('/price/usd/gbp')
  .xml()
  .on('ok', function(response) {
    // use data from response
  })
  .get()
```

### `.text()`

A convenience methods for setting the accept type header to `'text/plain'`:

```javascript
address('/price/usd/gbp')
  .text()
  .on('ok', function(response) {
    // use data from response
  })
  .get()
```


## Handling the response

### `.on(RESPONSE TYPE, cb)`

Listen for any response type as specified in the [HTTP/1.1 specification](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html):

_listen for: `successful`_
```javascript
address('/price/usd/gbp')
  .on('successful', function(response) {
    // handle response
  })
  .get()
```
_listen for: `client-error`_
```javascript
address('/price/usd/gbp')
  .on('client-error', function(response) {
    // handle response
  })
  .get()
```

| Status Code Name  | Status Code |
|-------------------|-------------|
| `'informational'` |     1xx     |
| `'successful'`    |     2xx     |
| `'redirection'`   |     3xx     |
| `'client-error'`  |     4xx     |
| `'server-error'`  |     5xx     |

### `.on(STATUS CODE NAME, cb)`

Listen for specific status code, based open the corresponding names as defined in the [specification](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html):

_listen for: `created`_
```javascript
address('/price/usd/gbp')
  .on('created', function(response) {
    // use data from response
  })
  .get()
```

_listen for: `bad-request`_
```javascript
address('/price/usd/gbp')
  .on('bad-request', function(response) {
    // handle error response
  })
  .get()
```

| Example Status Code Name | Status Code |
|--------------------------|-------------|
| `'ok'`                   |     200     |
| `'created'`              |     201     |
| `'bad-request'`          |     400     |
| `'unauthorized'`         |     401     |
| `'service-unavailable'`  |     503     |

### `.on('done', cb)`

Listen to when a request completes, regardless of status code:

```javascript
address('/price/usd/gbp')
  .on('done', function(response) {
    // handle error response
  })
  .get()
```

### `.on('err', cb)`

Listen for the exception to be thrown during the request.

There are some errors that get sent from address:

- If the requested resource does not support the specified method a [405](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) error response will be returned.
- If the requested resource does not support the specified accept type a [415](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) error response will be returned.

```javascript
address('/price/usd/gbp')
  .on('err', function(response) {
    // handle error response
  })
  .get()
```

## Building a resource

To build a resource, some of the following exports might need to be imported:

```javascript
// using ES6 modules
import { ok, error, created, redirect, response } from '@zambezi/address'

export function(req, res) {
  // handle request and call `res` with response
}

// using AMD modules
define([
  '@zambezi/address/lib/ok'
, '@zambezi/address/lib/error'
, '@zambezi/address/lib/created'
, '@zambezi/address/lib/redirect'
, '@zambezi/address/lib/response'
], function(ok, error, created, redirect, response) {
  return function(req, res) {
    // handle request and call `res` with response
  }
})
```

### `req.body`

The body payload associated with the request - _see [`address.body()`](#body):_

```javascript
var value = req.headers

// value === { foo: 'bar' }
```

### `req.headers`

An object of key-value properties for the headers associated with the request - _see [`address.header()`](#header):_

```javascript
var value = req.headers

// value === { accept: 'application/json' }
```

### `req.method`

The method associated with the request - _see [`address.method()`](#method):_

```javascript
var value = req.method

// value === 'get'
```

### `req.origin`

The origin DOM node associated with the request - _see [`address.origin()`](#origin):_

```javascript
var value = req.origin

// value === <div class="z-app"/>
```

### `req.params`

An object of key-value properties for the params associated with the request - _see [`address.param()`](#param):_

```javascript
var value = req.params

// value === { ccy1: 'usd', ccy2: 'gbp' }
```

### `req.uri`

The uri associated with the request - _see [`address(uri)`](#addressuri) and [`address.uri()`](#uri):_

```javascript
var value = req.url

// value === '/price/usd/gbp'
```

### `res()`

The callback function, for passing back an error or a response object - _see [`response(STATUS CODE, BODY, HEADERS)`](#responsestatus-code-body-headers)_.

An error should only be passed when there is a problem with making a request, where as when there is an error due to some response (such as a network request) should pass a response object.

_example: with error_
```javascript
if (/* missing request parameter*/) {
  res('Parameter "ccy1" has not been supplied.')
}
```

_example: with an [`ok()`](#ok) response object_
```javascript
res(null, ok({ amount: 10000, ccy1: 'usd', ccy2: 'gbp' }))
```

_example: with an [`error()`](#error) response object_
```javascript
res(null, error(401, { message: 'User does not have permissions to make request' }))
```

### `response(STATUS CODE, BODY, HEADERS)`

A response object, which allows the status code, body and headers to be supplied.

A resource function **must** call the response function with an appropriate response.

```javascript
res(null, response(201, { amount: 10000, ccy1: 'usd', ccy2: 'gbp' }, { 'location': 'order/1221' }))
```

### `ok(BODY)`

A convenience method for a http status code 200 response object:

```javascript
res(null, ok({ amount: 10000, ccy1: 'usd', ccy2: 'gbp' }))
```

### `error(ERROR CODE, BODY)`

A convenience method for a http status code 4xx or 5xx response object:

```javascript
res(null, error(401, { message: 'User does not have permissions to make request' }))
```

### `created(LOCATION, BODY)`

A convenience method for a http status code 201 response object:

```javascript
res(null, created('order/1221', { amount: 10000, ccy1: 'usd', ccy2: 'gbp' }))
```

### `redirect(LOCATION)`

A convenience method for a http status code 302 response object:

```javascript
res(null, redirect('price/usd/gbp/now'))
```

## Listening to a stream resource

### `address.stream()`

A convenience methods for setting the accept type header to `'application/x.zap.stream'`:

```javascript
var stream

address('/price/usd/gbp')
  .stream()
  .on('ok', function(response) {
    stream = result.body
    // handle stream object
  })
  .get()
```

### `.on('error', cb)`

Listen for errors sent on the stream:

```javascript
var stream

address('/price/usd/gbp')
  .stream()
  .on('ok', function(response) {
    stream = result.body
    stream.on('error.custom-namespace', function (error) {
      // Handle the error
    })
  })
  .get()
```

### `.on('message', cb)`

Listen for messages sent on the stream:

```javascript
var stream

address('/price/usd/gbp')
  .stream()
  .on('ok', function(response) {
    stream = result.body
    stream.on('message.custom-namespace', function (message) {
      // Handle the message
    })
  })
  .get()
```

### `.on('status', cb)`

Listen for status data sent on the stream:

```javascript
var stream

address('/price/usd/gbp')
  .stream()
  .on('ok', function(response) {
    stream = result.body
    stream.on('status.custom-namespace', function (status) {
      // Handle the status data
    })
  })
  .get()
```


## Building a stream resource

A stream resource is a resource with accept type `application/x.zap.stream`.
Streams resources, when received, expose the `on` method and can be listened to for different types of messages.

To build a resource, some of the following exports might need to be imported:

```javascript
// using ES6 modules
import { stream } from '@zambezi/address'

// using AMD modules
define([
  '@zambezi/address/lib/stream'
], function(ok, error, created, redirect, response) {
  // ...
})
```

### `stream()`

A factory method for producing a stream object.

```javascript
return function handler(req, res) {
  var resourceStream = stream()

  // ...

  res(null, ok(resourceStream))
}
```

### `resourceStream.on('firstsubscribed', cb)`

Listen to when the first subscription has been made to the stream.

Typically a stream should not be performing any activity until there has been some subscription to the stream.

```javascript
return function handler(req, res) {
  var resourceStream = stream()
      .on('firstsubscribed', function() {
        // start up or connect to any network (or other) resources that you will want to stream
      })

  res(null, ok(resourceStream))
}
```

### `resourceStream.on('lastunsubscribed', cb)`

Listen to when the last subscription has been closed for the stream.

Typically a stream should clean up any connections or scheduled work when there are no longer any subscribers to the stream

```javascript
return function handler(req, res) {
  var resourceStream = stream()
      .on('lastunsubscribed', function() {
        // clean up any connections or scheduled work
      })

  res(null, ok(resourceStream))
}
```

### `resourceStream()`

A convenience method to send a message over the stream - _see [`resourceStream.message()`](#resourcestreammessage):_

```javascript
return function handler(req, res) {
  var resourceStream = stream()

  // Send message over stream
  resourceStream({ data: [1, 2, 3], id: 934 })

  res(null, ok(resourceStream))
}
```

### `resourceStream.error()`

Sends an error over the stream:

```javascript
return function handler(req, res) {
  var resourceStream = stream()

  // Send error over stream
  resourceStream.error({ message: 'No data found for item 934' })

  res(null, ok(resourceStream))
}
```

### `resourceStream.message()`

Sends a message over the stream:

```javascript
return function handler(req, res) {
  var resourceStream = stream()

  // Send message over stream
  resourceStream.message({ data: [1, 2, 3], id: 934 })

  res(null, ok(resourceStream))
}
```

### `resourceStream.status()`

Sends an status data over the stream:

```javascript
return function handler(req, res) {
  var resourceStream = stream()

  // Send status data over stream
  resourceStream.status({ message: 'Reconnecting to server' })

  res(null, ok(resourceStream))
}
```

## Requesting DOM view resource

### `address.view()`

A convenience methods for setting the accept type header to `'application/x.nap.view'`:

```javascript
address('/price/usd/gbp')
  .view()
  .on('ok', function(response) {
    // handle view function
  })
  .get()
```

### `address.app()`

A convenience methods for setting the accept type header to `'application/x.am.app'`:

```javascript
address('/price/usd/gbp')
  .app()
  .on('ok', function(response) {
    // handle view function
  })
  .get()
```

### `address.into()`

A convenience method to remove the need for boilerplate whilst also checking for error status codes
and validating the content type of the response. Using the `into` api also triggers an `update` event
on the target node as a hook for existing views.

This method can either takes a DOM node, though a valid CSS selector can also be used in place of a
document element reference.  If a CSS selector is provided, then the selection will be performed in
the context of the document.

If you don't specify a target for the `into` it will be targeted into the root node (`.z-app` by default).

_example: DOM node_
```javascript
var node = document.getElementsByClassName('.price')[0]

address('/price/usd/gbp')
  .into(node)
  .get()
```

_example: CSS selector_
```javascript
address('/price/usd/gbp')
  .into('.price')
  .get()
```

_example: without `.into()` call_
```javascript
var node = document.getElementsByClassName('.price')[0]

address('/price/usd/gbp')
  .on('ok', function(response) {
    var view = response.body
    view(node)
  })
  .get()
```

## Building DOM view resource

```javascript
return function(req, res) {
  res(null, ok(view))

  function view (node) {
    // render and listen to events on the DOM node
  }
}
```

### `node.addEventListener('update', cb)`

Dispatched before invoking a view function, regardless of the resource addressed into the DOM element of the view.

```javascript
function view(node) {
  node.addEventListener('update', handleUpdate)

  function handleUpdate(detail) {
    console.log('Updating resource from %s to %s.', deatail.from, detail.to)
  }
}
```

### `node.addEventListener('resourcewillchange', cb)`

Dispatched before invoking a view function with a new resource.

```javascript
function view(node) {
  node.addEventListener('resourcewillchange', handleResourceWillChange)

  function handleResourceWillChange() {
    console.log('Resource will change: do you want to clear the DOM?.')
  }
}
```

## Top level navigation

### `.navigate()`

Sometimes it is neccessary to perform a top level navigation by updating the browser address bar.

If a target is specified the request will be opened in the target window.

_example: perform top level navigation_
```javascript
address('/price/usd/gbp')
  .navigate()
```

_example: perform navigation into target window_
```javascript
address('/price/usd/gbp')
  .navigate('_blank')
```

### `.target()`

Provides set or get of the resource navigation target to be requested:

```javascript
address('/price/usd/gbp')
  .target('_blank')
  .navigate()
```
