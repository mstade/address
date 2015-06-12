#1.1.0

## Bug fixes

* This version fixes a known issue where a DOM node would not be cleared when a different resource was addressed into it.

## New features

* A new `CustomEvent “resourcewillchange”` is now dispatched by the DOM node before it is cleared by am-address.
