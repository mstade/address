# am-address

Address is the API library for the Agile Markets Resource Oriented Architecture.

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

we can request the resource in a number of ways.

### Using the path directly

Here configure the request by using the resource path with the path variables filled in.
We add a callback using the ```.then()``` method. The callback will be invoked when the resource responds. The data parameter will be populated with the response object. Any data returned form the resource will be in the ```response.body``` property

```
// Configure the request

var request = address("/price/usd/gbp").then(function(err, data) {
  // use data from resource
}))

// make the request by invoking the function

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

// multpile params

var request = 
  address("/price/{ccy1}/{ccy2}")
    .param({ccy1 : "usd", ccy2 : "gbp"})
    .then(function(err, data) {
      // use data from resource
    }))
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





  
