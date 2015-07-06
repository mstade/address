define(function(require) {

  findClosest.anchor = function(node, baseCase) {
    return findClosest(function(n) {
      return n.nodeName == 'A' && n.href
    }, node, baseCase)
  }

  findClosest.root = function(node, baseCase) {
    var zapps = document.querySelectorAll('.z-app')
    return findClosest(function(n) {
      return _.contains(zapps, n)
    }, node, baseCase)
  }

  return findClosest

  function findClosest(fn, node, baseCase) {
    if (!node) return baseCase
    if (fn(node)) return node
    return findClosest(fn, node.parentNode, baseCase)
  }

})
