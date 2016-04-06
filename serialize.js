define(
  []
, function() {

    return function(query) {
      var params = Object.keys(query).reduce(function(a,k) {
        a.push(k + '=' + query[k])
        return a
      },[])
      return params.length ? '?' + params.join('&') : ''
    }
  
  }
)