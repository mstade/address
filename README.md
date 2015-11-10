# am-address

Address is an API interfacing with [nap][1], to help implement applications following a [Resource Oriented Architecture][2].

[1]: https://github.com/websdk/nap
[2]: http://en.wikipedia.org/wiki/Resource-oriented_architecture

It provides:

* an api for configuring and invoking requests for resources
* utilities for creating appropriate responses from resources
* utilities for displaying resources in the DOM

## Usage

Include the address library as a dependency to your AMD module using the module name 'address'. Optionally include the 'ok' and 'error' utilites.

```javascript
define(
  [ 'am-address/address'
  ]
  , function(address) {

    ...

  }
)
```

---

Next, let's dive into [how to make requests](man/requests.html).