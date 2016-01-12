
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