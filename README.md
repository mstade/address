# am-address

Address is the API library for the Agile Markets [Resource Oriented Architecture](http://en.wikipedia.org/wiki/Resource-oriented_architecture).

It provides 

* an api for configuring and invoking requests for resources
* utilities for creating appropriate responses from resources
* utilities for displaying resources in the DOM

For more information and tutorials about how to define and expose resources in the Agile Markets platform please see the [Hello World tutorial](https://stash.dts.fm.rbsgrp.net/projects/ZAP/repos/hello-world/browse).

## Usage

Include the address library as a dependency to your AMD module using the namespaced module name 'am-address/address'.
Optionally include the 'ok' and 'error' utilites

```
define(
  [ 'am-address/address'
  , 'am-address/ok'
  , 'am-address/error'
  ]
  , function(address, ok, error) {

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

Here we configure the request by using the resource path with the path variables filled in.
We add a callback using the ```.then()``` method. The callback will be invoked when the resource responds. The data parameter will be populated with the response object. Any data returned form the resource will be in the ```response.body``` property

```
// Configure the request

var request = address("/price/usd/gbp").then(function(err, data) {
  // use data from resource
}))

// make the request by invoking the function

request()

```

Alternatively we could set the path using the ```.uri()``` method

```
var request = address()
  .uri("/price/usd/gbp")
  .then(function(err, data) {
    // use data from resource
  }))

request()

```

### Adding parameters

Path parameters can be added through the ```.param()``` method.

```
// individual params

var request = 
  address("/price/{ccy1}/{ccy2}")
    .param("ccy1", "usd")
    .param("ccy2", "gbp")
    .then(function(err, data) {
      // use data from resource
    }))

request()

// multpile params

var request = 
  address("/price/{ccy1}/{ccy2}")
    .param({ccy1 : "usd", ccy2 : "gbp"})
    .then(function(err, data) {
      // use data from resource
    }))

request()
```

We can also request the resource by it's name

```
var request = 
  address("price")
    .param("ccy1", "usd")
    .param("ccy2", "gbp")
    .then(function(err, data) {
      // use data from resource
    }))

request()
```

### Specifying a method

Different resource methods can be invoked by specifying a ```method``` on the request.

```
var request = 
  address("/price/usd/gbp")
    .method("send")
    .then(function(err, data) {
      // use data from resource
    }))

request()
```

Supported methods are

* GET
* SEND
* PUT
* REMOVE

If the requested resource does not support the specified method a [405](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) error response will be returned.

### Adding headers

Request headers convey further information about how the reuqest should be handled.
For example, resources may route requests to different handlers based on the ```accept type``` of the request.
Specify the ```accept type``` header using the ```.header()``` api.

```
var request = 
  address("/price/usd/gbp")
    .header("accept-type", "application/json")
    .then(function(err, data) {
      // use data from resource
    }))

request()
```

Supported headers are

* accept-type

Accept types must conform to the [HTTP field definition](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html)

The default accept type for requests is "application/x.nap.view" which is the type for a 

If the requested resource does not support the specified accept type a [415](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) error response will be returned.

### Adding a body

You may wish to send a body with your request. This can be any object and will be accessible to the resource through the ```request.body``` property.

```
var request = 
  address("/price/usd/gbp")
    .body({foo:"bar"})
    .then(function(err, data) {
      // use data from resource
    }))

request()
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

      res( ok(view) )
    }
    
  }
)
```
As can be seen, this resource is returning a function which should be invoked with a DOM node as a parameter.
We can use it like this:

```
var node = d3.select(".price").node()

address("/price/usd/gbp").then(function(err, data) {
  data.body(node)
})
```

## into utility

The ```into``` utility removes the need for this boilerplate whilst also checking for error status codes and validating the content type of the response.
Using the ```into``` api also triggers an ```update``` event on the target node as a hook for existing views.

The above example can be re-written using the 'into' api as follows:

```
address("/price/usd/gbp").into(node)
```


## ok, error utlities

A resource function **must** call the response function with an appropriate response.
Use the 'ok' and 'error' utilites to generate a response object with your data or an error response.

```
ok(DATA)
error(ERROR CODE)
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
        res( error(400) )
        return
      }

      // all ok
      res( ok("hello world!") )
    }

  }
)
```

## Look up a resource by name

The ```address.resource()``` api provides a way to look up an existing resource. It takes a resource name as a parameter and returns the resource definition object.

```
address.resource("price")

->  {
      name : "price"
      path : "/price/{ccy1}/{ccy2}"
      methods : function() { ... }
    }
```







  
