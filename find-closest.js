define(function(require) {

  var _ = require('underscore')

  function findClosest(fn, node, baseCase) {
    if (!node) return baseCase
    if (fn(node)) return node
    return findClosest(fn, node.parentNode, baseCase)
  }

  findClosest.anchor = function(node, baseCase) {
    return findClosest(function(n) {
      return n.nodeName == 'A' && n.href
    }, node, baseCase)
  }

  findClosest.bySelector = function(selector, node, baseCase) {
    var selection = document.querySelectorAll(selector)
    return findClosest(function(n) {
      return _.contains(selection, n)
    }, node, baseCase)
  }

  return findClosest
})
