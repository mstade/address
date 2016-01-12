# Handling responses

Listeners can be added for any response type as specified in the [HTTP/1.1 specification](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html).


The event names correspond to the status code of the response as defined in the [specification](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html)
e.g. `ok` is a 200 status code, `not-found` is a 404 status code.


Listeners can also be added for categories of response, e.g. `successful` is triggered for any response in the 200 range,  `client-error` is triggered for any response in the 400 range, etc.

There are also two general events:

  - `done` – triggered when a request completes, regardless of status code
  - `err` – triggered if an exception is thrown during the request

---

Next, we'll dive deeper into [resource functions](resources.html)