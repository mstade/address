define(function(require) {
  var zapp = require('z-app')

  describe('Multiple roots', function() {
    var a, b, c, d, e, f, g

    before(function() {
      // a (root)
      // |-- b
      // |   |-- d (root)
      // |   |   `-- g
      // |   `-- e
      // `-- c (root)
      //     `-- f
      a = zapp.root() // default root
      b = createElement(a)
      c = createElement(a, true)
      d = createElement(b, true)
      e = createElement(b)
      f = createElement(c)
      g = createElement(d)
    })

    after(function() {
      a.removeChild(b)
      a.removeChild(c)
    })

    it('default root should be body', function() {
      a.should.equal(document.body)
    })

    it('should find the appropriate root for each element', function() {
      zapp.root(a).should.equal(a)
      zapp.root(b).should.equal(a)
      zapp.root(c).should.equal(c)
      zapp.root(d).should.equal(d)
      zapp.root(e).should.equal(a)
      zapp.root(f).should.equal(c)
      zapp.root(g).should.equal(d)
    })

  })

  function createElement(parent, isRoot) {
    var el = document.createElement('div')
    if (isRoot) el.className = 'z-app'
    parent.appendChild(el)
    return el
  }
})
