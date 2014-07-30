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
Optionally include the 'ok' and 'error' utilites

```
define(
  [ 'am-address/address'
  ]
  , function(address) {

    ...
    
  }
)

``` 

## Requesting a resource

Assuming we want to use a resource named **price** which has both a data and a view representation and is defined with the following path:

```
/price/{ccy1}/{ccy2}
```

the api allows us to request the resource in a number of ways.

### Using the path directly

Configure the request by using the resource path with the path variables filled in.
We add a callback for a specific [response type](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) using the ```.on()``` method. The callback will be invoked when the resource responds with the specified response type. The parameter will be the response object. Any data returned form the resource will be in the ```response.body``` property.

```
// Configure the request and invoke the appropriate request method

address("/price/usd/gbp")
  .on('ok', function(response) {
    // use data from response
  })
  .get()

```

Alternatively we could set the path using the ```.uri()``` method

```
address()
  .uri("/price/usd/gbp")
  .on('ok', function(response) {
    // use data from response
  })
  .get()

```

### Adding parameters

Path parameters can be added through the ```.param()``` method and will be interpolated into the path.

```
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

Search parameters can be added through the ```.query()``` method and will be appended to the path.

```
address("/price/usd/gbp")
  .query("ccy1", "usd")
  .query("ccy2", "gbp")

-> /price/usd/gbp?ccy1=usd&ccy2=gbp
```

### Specifying a method

Different resource methods can either be specified explicitly or invoked by calling a ```request method``` on the request.

```
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
For example, resources may route requests to different handlers based on the ```accept type``` of the request.
Specify the ```accept type``` header using the ```.header()``` api.

```
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

```
address("/price/usd/gbp")
  .json()
  .get()
```

Currently supported methods are:

```
.json()
.xml()
.text()
.view()
.app()
.stream()
```

### Adding a body

You may wish to send a body with your request. This can be any object and will be accessible to the resource through the ```request.body``` property.
This can either be set explicitly using the ```.body()``` method, or by passing the payload to the request method.

```
address("/price/usd/gbp")
  .body({foo:"bar"})
  .post()

address("/price/usd/gbp")
  .post({foo:"bar"})
```

## Adding a resource view to the DOM

Often you will be requesting a view of a paticular resource which you want to display in the page.
As mentioned, the default accept type of a request is "application/x.nap.view". 
The response to a request with this header will be a response object in which the ```.body``` property will contain a view function which can be invoked on a DOM node.

As an example, our **price** resource may expose a view representation of the price defined by the path parameters. The resource function definition would then look as follows:

```
define(
  [ 'am-address/ok'
  ]
  , function(ok) {

    return function(req, res) {

      var ccy1 = req.params.ccy1
        , ccy2 = req.params.ccy2

      var price = price_service.getPrice(ccy1, ccy2)

      var view = function(node) {
        node.innerHTML(price)
      }

      res( null, ok(view) )
    }
    
  }
)
```
As can be seen, this resource is returning a function which should be invoked with a DOM node as a parameter.
We can use it like this:

```
var node = d3.select(".price").node()

address("/price/usd/gbp")
  .on('ok', function(response) {
    var view = response.body
    view(node)
  })
  .get()
```

## into utility

The ```into``` utility removes the need for this boilerplate whilst also checking for error status codes and validating the content type of the response.
Using the ```into``` api also triggers an ```update``` event on the target node as a hook for existing views.

The above example can be re-written using the 'into' api as follows:

```
var node = d3.select(".price").node()
address("/price/usd/gbp").into(node).get()
```
A valid CSS selector can also be used in place of a document element reference, so the above example could also be written as

```
address("/price/usd/gbp").into(".price").get()
```

Note that in this case the selection will be performed in the context of the document.


## response utlities

A resource function **must** call the response function with an appropriate response.
Use the 'ok',  'error' and other utilites to generate a response object with your data.

```
ok(BODY)
error(ERROR CODE, BODY)
created(LOCATION, BODY)
redirect(LOCATION)
```

```
define(
  [ 'am-address/ok'
  , 'am-address/error'
  ]
  , function(ok, error) {

    return function(req, res) {

      // resource logic goes here...

      if( // bad request ) {
        res( null, error(400, 'something went wrong') )
        return
      }

      // all ok
      res( null, ok("hello world!") )
    }

  }
)
```

## Performing a top level navigation

Sometimes it is neccessary to perform a top level navigation by updating the browser address bar. This can be accomplished by using the ```address.navigate()``` method.

If a target is specified the request will be opened in the target window.

```
address("/price/usd/gbp").navigate()

address("/price/usd/gbp").navigate('_blank')

address("/price/usd/gbp")
  .target('_blank')
  .navigate()
```







  
