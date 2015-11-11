#1.3.0

## New features

* `address(path).origin(node).navigate()`: New api to specify the DOM element from which a request originates. This allows multiple roots on the same browser window.

#1.1.0

## Bug fixes

* This version fixes a known issue where a DOM node would not be cleared when a different resource was addressed into it.

## New features

* A new `CustomEvent “resourcewillchange”` is now dispatched by the DOM node before it is cleared by address.
