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
