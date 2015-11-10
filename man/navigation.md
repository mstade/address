# Performing a top level navigation

Sometimes it is neccessary to perform a top level navigation by updating the browser address bar. This can be accomplished by using the ```address.navigate()``` method.

If a target is specified the request will be opened in the target window.

```javascript
address("/price/usd/gbp").navigate()

address("/price/usd/gbp").navigate('_blank')

address("/price/usd/gbp")
  .target('_blank')
  .navigate()
```

## DOM origin

To disambiguate the DOM element used as the local root when navigating, it is possible to specify an origin node when building a request:

```javascript
address('/price/usd/gbp').origin(node).navigate()

address('/price/usd/gbp').origin(node).into().get()
```

The `origin` node provided should be a descendant of the root node in which the request should be resolved. In cases where the running application contains more than one possible root (for instance when running in browser workspaces), specifying an origin node allows address to navigate in the correct window.