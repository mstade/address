#### Stream resources
A stream resource is a resource with accept type `application/x.zap.stream`.
Streams resources, when received, expose the `on` method and can be listened to for different types of messages.

Here's a summary on how to use a stream resource:

- `resource.json`:

```
"methods": {
  "get": {
    "application/x.zap.stream" : "my-stream-resource"
  }
}
```

- `my-stream-resource.js`:

```
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

```
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