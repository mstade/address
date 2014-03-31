define(
  [ './address'
  ]
  , function(address) {

    return function(resource) {
      address(resource).into(this)()
    }
    
  }
)
  