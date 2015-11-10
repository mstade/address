# Adding a resource view to the DOM

Often you will be requesting a view of a particular resource which you want to display in the page. As mentioned, the default accept type of a request is "application/x.nap.view". The response to a request with this header will be a response object in which the `.body` property will contain a view function which can be invoked on a DOM node.

As an example, our `price` resource may expose a view representation of the price defined by the path parameters. The resource function definition would then look as follows:

```javascript
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

This resource is returning a function which should be invoked with a DOM node as a parameter. We can use it like so:

```javascript
var node = d3.select(".price").node()

address("/price/usd/gbp")
  .on('ok', function(response) {
    var view = response.body
    view(node)
  })
  .get()
```

## `into` utility

To make things easier, the `into` utility removes the need for this boilerplate whilst also checking for error status codes and validating the content type of the response. Using the `into` api also triggers an `update` event on the target node as a hook for existing views.

The above example can be re-written using the 'into' api as follows:

```javascript
var node = d3.select(".price").node()
address("/price/usd/gbp").into(node).get()
```

A valid CSS selector can also be used in place of a document element reference, so the above example could also be written as

```javascript
address("/price/usd/gbp").into(".price").get()
```

Note that in this case the selection will be performed in the context of the document.

## Custom events

Two custom events are dispatched by DOM elements used to render view resources:

### `update`

Dispatched before invoking a view function, regardless of the resource addressed into the DOM element of the view.

### `resourcewillchange`

Dispatched before invoking a view function with a new resource. After this event is dispatched, the contents of the view's DOM element are discarded and replaced.

###  Usage

```javascript
function view(node) {

  node.addEventListener('update', handleUpdate)
  node.addEventListener('resourcewillchange', handleResourceWillChange)

  function handleUpdate(detail) {
    console.log('Updating resource from %s to %s.', deatail.from, detail.to)
  }

  function handleResourceWillChange() {
    console.log('Resource will change: DOM will be cleared.')
  }
}

```

---

Next, let's discuss [response handling](../responses.html).