define(function() {
  return function on(type, listener, capture) {
    var name = "__on" + type
      , i = type.indexOf(".")

    if (i > 0) type = type.slice(0, i)

    function onRemove() {
      var l = this[name]
      if (l) {
        this.removeEventListener(type, l, l.$)
        delete this[name]
      }
    }

    function onAdd() {
      var l = onListener(listener)
      onRemove.call(this)
      this.addEventListener(type, this[name] = l, l.$ = capture)
      l._ = listener
    }

    function removeAll() {
      var re = new RegExp("^__on([^.]+)" + type.replace(/[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g, "\\$&") + "$")
        , match
      for (var name in this) {
        if (match = name.match(re)) {
          var l = this[name]
          this.removeEventListener(match[1], l, l.$)
          delete this[name]
        }
      }
    }

    return (i
      ? listener ? onAdd : onRemove
      : listener ? noop : removeAll).call(this)
  }

  function onListener(listener) {
    return function() {
      return listener.apply(this, arguments)
    }
  }
  
  function noop() {}
})