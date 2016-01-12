# Implementing resources

A resource function *must* call the response function with an appropriate response. Use the 'ok',  'error' and other utilites to generate a response object with your data.

```javascript
ok(BODY)
error(ERROR CODE, BODY)
created(LOCATION, BODY)
redirect(LOCATION)
response(CODE, BODY, HEADERS)
```

```javascript
define(
  [ 'address/ok'
  , 'address/error'
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

---

Next up: [navigation](navigation.html).