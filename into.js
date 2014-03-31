define(
  [ 'am-address'
  ]
  , function(address) {

    return function(resource) {
      address(resource).into(this)()
    }
    
  }
)
  