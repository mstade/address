define(function(require) {

  var d3 = require('d3')
    , zapp = d3.select('.z-app')
    , root = zapp.empty() ? d3.select('body').node() : zapp.node()

  return {
      isRoot: isRoot
    , root: function() { return root }
  }

  function isRoot(node) {
    return node == root
  }

})
