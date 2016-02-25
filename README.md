# am-address

Address is the API library for the Agile Markets [Resource Oriented Architecture](http://en.wikipedia.org/wiki/Resource-oriented_architecture).

It provides

* an api for configuring and invoking requests for resources
* utilities for creating appropriate responses from resources
* utilities for displaying resources in the DOM

For more information and tutorials about how to define and expose resources in the Agile Markets platform please see the [Hello World tutorial](https://stash.dts.fm.rbsgrp.net/projects/ZAP/repos/hello-world-new/browse).

## API versions

This document is for v1.x of the api which is currently only in the dev environment.


v1.x is fully backwards compatible with v0.x
For v0.x documentation please see [here](v0/README.md)

## Usage

Include the address library as a dependency to your AMD module using the namespaced module name 'am-address/address'.
Optionally include the 'ok' and 'error' utilities

```javascript
define(function(require) {
    var address = require('am-address/address')
    ...

  }
)

```

### Requesting a resource

Assuming we want to use a resource named **price** which has both a data and a view representation and is defined with the following path:

```
/price/{ccy1}/{ccy2}
```

the api allows us to request the resource in a number of ways.

### Using the path directly

Configure the request by using the resource path with the path variables filled in.
We add a callback for a specific [response type](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) using the `.on()` method. The callback will be invoked when the resource responds with the specified response type. The parameter will be the response object. Any data returned form the resource will be in the `response.body` property.

```javascript
// Configure the request and invoke the appropriate request method

address("/price/usd/gbp")
  .on('ok', function(response) {
    // use data from response
  })
  .get()

```

Alternatively we could set the path using the `.uri()` method

```javascript
address()
  .uri("/price/usd/gbp")
  .on('ok', function(response) {
    // use data from response
  })
  .get()

```

### Handling the response

Listeners can be added for any response type as specified in the [HTTP/1.1 specification](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html).


The event names correspond to the status code of the response as defined in the [specification](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html)
e.g. `ok` is a 200 status code, `not-found` is a 404 status code.


Listeners can also be added for categories of response, e.g. `successful` is triggered for any response in the 200 range,  `client-error` is triggered for any response in the 400 range, etc.

There are also two general events - `done` which is triggered when a request completes, reagrdless of status code, and `err` which is triggered if an exception is thrown during the request.

### Adding parameters

Path parameters can be added through the `.param()` method and will be interpolated into the path.

```javascript
// individual params

address("/price/{ccy1}/{ccy2}")
  .param("ccy1", "usd")
  .param("ccy2", "gbp")
  .get()

// multpile params

address("/price/{ccy1}/{ccy2}")
  .param({ccy1 : "usd", ccy2 : "gbp"})
  .get()
```

Search parameters can be added through the `.query()` method and will be appended to the path.

```javascript
address("/price/usd/gbp")
  .query("ccy1", "usd")
  .query("ccy2", "gbp")

-> /price/usd/gbp?ccy1=usd&ccy2=gbp
```

### Specifying a method

Different resource methods can either be specified explicitly or invoked by calling a `request method` on the request.

```javascript
address("/price/usd/gbp").post( // some data // )

//

address("/price/usd/gbp")
  .method('post')
  .body( // some data // )
  () // invoke request
```

Supported methods are

* GET
* POST
* SEND
* PUT
* REMOVE

The semantics of these methods should be equivalent to the standard [HTTP verbs](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html)

If the requested resource does not support the specified method a [405](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) error response will be returned.

### Adding headers

Request headers convey further information about how the request should be handled.
For example, resources may route requests to different handlers based on the `accept type` of the request.
Specify the `accept type` header using the `.header()` api.

```javascript
address("/price/usd/gbp")
  .header("accept-type", "application/json")
  .on('ok', function(response) {
    // use data from response
  })
  .get()
```

Accept types must conform to the [HTTP field definition](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html)

The default accept type for requests is "application/x.nap.view" which is the type for a view resource.

If the requested resource does not support the specified accept type a [415](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) error response will be returned.

Convenience methods are provided for common accept types. e.g.

```javascript
address("/price/usd/gbp")
  .json()
  .get()
```

Currently supported methods are:

```javascript
.json()
.xml()
.text()
.view()
.app()
.stream()
```

#### Stream resources
A stream resource is a resource with accept type `application/x.zap.stream`.
Streams resources, when received, expose the `on` method and can be listened to for different types of messages.

Here's a summary on how to use a stream resource:

- `resource.json`:

```javascript
"methods": {
  "get": {
    "application/x.zap.stream" : "my-stream-resource"
  }
}
```

- `my-stream-resource.js`:

```javascript
var createStream = require('am-address/stream')

//...

return function handler(req, res) {
  var stream = createStream()
      .on('firstsubscribed', onFirstSubscribed)
      .on('lastunsubscribed', onLastUnsubscribed)

  res(ok(stream))

  function onFirstSubscribed(){
    console.log("Your first subscriber has now subscribed")
    // ...
  }

  function onLastUnsubscribed(){
    console.log("the streams has no more subscribers")
    // ...
  }

  // ...

  // You can use stream.status(msg), stream.message(msg), stream.error(msg)
  // stream(msg) defaults to stream.message

  stream({
    your: 'message'
  })

}
```

- `my-stream-listener.js`

```javascript
//...
var stream

address("/my-stream-resource-name")
  .stream()
  .on('ok', onStreamOk)()

function onStreamOk(result) {
  stream = result.body
  stream.on('message.custom-namespace', onStreamMessage)
}

function onStreamMessage(message) {
  console.log("Just received a message from the stream", message)

  //...
  console.log("Now unsubscribing from the stream.")
  stream.on('message.custom-namespace', null)
}
```


### Adding a body

You may wish to send a body with your request. This can be any object and will be accessible to the resource through the `request.body` property.
This can either be set explicitly using the `.body()` method, or by passing the payload to the request method.

```javascript
address("/price/usd/gbp")
  .body({foo:"bar"})
  .post()

address("/price/usd/gbp")
  .post({foo:"bar"})
```

## Adding a resource view to the DOM

Often you will be requesting a view of a paticular resource which you want to display in the page.
As mentioned, the default accept type of a request is "application/x.nap.view".
The response to a request with this header will be a response object in which the `.body` property will contain a view function which can be invoked on a DOM node.

As an example, our **price** resource may expose a view representation of the price defined by the path parameters. The resource function definition would then look as follows:

```javascript
define(function(require) {
    var ok = require('am-address/ok')

    return function(req, res) {

      var ccy1 = req.params.ccy1
        , ccy2 = req.params.ccy2

      var price = price_service.getPrice(ccy1, ccy2)

      var view = function(node) {
        node.innerHTML(price)
      }

      res( ok(view) )
    }

  }
)
```
As can be seen, this resource is returning a function which should be invoked with a DOM node as a parameter.
We can use it like this:

```javascript
var node = d3.select(".price").node()

address("/price/usd/gbp")
  .on('ok', function(response) {
    var view = response.body
    view(node)
  })
  .get()
```

## into utility

The `into` utility removes the need for this boilerplate whilst also checking for error status codes and validating the content type of the response.
Using the `into` api also triggers an `update` event on the target node as a hook for existing views.

The above example can be re-written using the 'into' api as follows:

```javascript
var node = d3.select(".price").node()
address("/price/usd/gbp").into(node).get()
```
A valid CSS selector can also be used in place of a document element reference, so the above example could also be written as

```javascript
address("/price/usd/gbp").into(".price").get()
```

Note that in this case the selection will be performed in the context of the document.

If you don't specify a target for the `into` it will be targeted into the root node (`.z-app` by default).

## response utlities

A resource function **must** call the response function with an appropriate response.
Use the 'ok',  'error' and other utilites to generate a response object with your data.

```javascript
ok(BODY)
error(ERROR CODE, BODY)
created(LOCATION, BODY)
redirect(LOCATION)
response(CODE, BODY, HEADERS)
```

```javascript
define(
  [ 'am-address/ok'
  , 'am-address/error'
  ]
  , function(ok, error) {

    return function(req, res) {

      // resource logic goes here...

      if( // bad request ) {
        res( error(400, 'something went wrong') )
        return
      }

      // all ok
      res( ok("hello world!") )
    }

  }
)
```

## Performing a top level navigation

Sometimes it is neccessary to perform a top level navigation by updating the browser address bar. This can be accomplished by using the `address.navigate()` method.

If a target is specified the request will be opened in the target window.

```javascript
address("/price/usd/gbp").navigate()

address("/price/usd/gbp").navigate('_blank')

address("/price/usd/gbp")
  .target('_blank')
  .navigate()
```

### DOM origin

To disambiguate the DOM element used as the local root when navigating, it is possible to specify an origin node when building a request:

```javascript
address('/price/usd/gbp').origin(node).navigate()

address('/price/usd/gbp').origin(node).into().get()
```

The `origin` node provided should be a descendant of the root node in which the request should be resolved. In cases where the running application contains more than one possible root (for instance when running in browser workspaces), specifying an origin node allows address to navigate in the correct window.

## Custom events

Two custom events are dispatched by DOM elements used to render view resources:

### `update`

Dispatched before invoking a view function, regardless of the resource addressed into the DOM element of the view.

### `resourcewillchange`

Dispatched before invoking a view function with a new resource.

###  Usage

```javascript
function view(node) {

  node.addEventListener('update', handleUpdate)
  node.addEventListener('resourcewillchange', handleResourceWillChange)

  function handleUpdate(detail) {
    console.log('Updating resource from %s to %s.', deatail.from, detail.to)
  }

  function handleResourceWillChange() {
    console.log('Resource will change: do you want to clear the DOM?.')
  }
}

```

## Resource composition

You can compose multiple resources into one. When you have a higher level resource that composes other resources, you can mark that adding the composed paths to the `composes` list to this higher level resource.
Whenever a request is targeted to a *node* whose current resource is composed of the requested one, the **composition** will be requested instead.

For example:

```javascript
[
  {
    "name": "Overview"
  , "path": "/overview/{id}"
  , "composes": [
      "/article/{id}"
    , "/authors-for/{id}"
    ]
  , "methods":
    {
      "get": {
        "application/x.nap.view": [
          { "*": "example/overview" }
        ]
      }
    }
  }
]
```

Let's load the overview page into the *root* by

```javascript
address('/overview/{id}')
  .param('id', 123)
  .navigate()

```

Later if we navigate to an article with

```
address('/article/{id}')
  .param('id', 1)
  .query('order', 'asc')
  .navigate()
```

`/overview/1?order=asc` will be loaded, as `/overview/{id}` **composes** `/article/{id}` and `/authors-for/{id}` **and** it is currently loaded into the *root*.

The responsibility for loading the composed resources is up to the composer.

To pass on the query string to the composed resource in the `/overview/{id}` resource you could use something like:

```javascript
address(req.uri)
  .uri('/article/{id}')
  .param('id', req.params.id)
  .into(node)
  .get()
```
