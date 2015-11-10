# Requesting a resource

Assuming we want to use a resource named **price** which has both a data and a view representation and is defined with the following path:

```
/price/{ccy1}/{ccy2}
```

the api allows us to request the resource in a number of ways.

## Using the path directly

Configure the request by using the resource path with the path variables filled in. We add a callback for a specific [response type](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) using the `.on()` method. The callback will be invoked when the resource responds with the specified response type. The parameter will be the response object. Any data returned form the resource will be in the `response.body` property.

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

## Adding a body

You may wish to send a body with your request. This can be any object and will be accessible to the resource through the ```request.body``` property.
This can either be set explicitly using the ```.body()``` method, or by passing the payload to the request method.

```javascript
address("/price/usd/gbp")
  .body({foo:"bar"})
  .post()

address("/price/usd/gbp")
  .post({foo:"bar"})
```

---

Next, let's look at [application views](requests/views.html).