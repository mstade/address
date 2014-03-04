define(
  [ 'Squire'
  , 'sinon'
  , 'jquery'
  ]
  , function(Squire, sinon, $) {

    var address
      , web
      , nap
      , type

    beforeEach(function(done) {

      var injector = new Squire();

      web = { 
        req : sinon.spy() 
      , resource : sinon.spy() 
      , uri : function(uri, params) {
          var paramsString = ""
          Object.keys(params).forEach(function(key) {
            paramsString += "/" + params[key]
          })
          return uri.split("/{")[0] + paramsString
        }
      }

      nap = { 
        into : sinon.spy() 
      }

      type = { 
        isString : function(obj) { return typeof obj === "string" }
      , isObject : function(obj) { return typeof obj !== "string" }
      }

      injector.mock(
        'web'
      , function() {
        return web
      })
      .mock(
        'nap'
      , function() {
        return nap
      })
      .mock(
        'type/type'
      , function() {
        return type
      })
      .require(
        [ 'address' ]
      , function(a) {
          address = a
          done()
        }
      )
    })

    describe('Address', function() {

      it('should store the resource in the closure', function() {
        address("/wibble")
          .uri()
          .should.equal("/wibble")
      })

      it('should set the uri', function() {
        address()
          .uri("/wibble")
          .uri()
          .should.equal("/wibble")
      })

      it('should set the method', function() {
        address()
          .method("get")
          .method()
          .should.equal("get")
      })

      it('should set the accept type', function() {
        address()
          .accept("json")
          .accept()
          .should.equal("json")
      })

      it('should add a parameter', function() {
        address()
          .params("foo", "bar")
          .params()
          .should.deep.equal({
            foo:"bar"
          })
      })

      it('should add a multiple parameters', function() {
        address()
          .params("foo", "bar")
          .params("baz", "bing")
          .params()
          .should.deep.equal({
            foo:"bar"
          , baz:"bing"
          })
      })

      it('should add a multiple parameters from an object', function() {
        address()
          .params({foo : "bar", baz : "bing"})
          .params()
          .should.deep.equal({
            foo:"bar"
          , baz:"bing"
          })
      })

      it('should add a multiple parameters from an object in a chain', function() {
        address()
          .params({foo : "bar", baz : "bing"})
          .params({wibble : "wobble"})
          .params("sausage", "chips")
          .params()
          .should.deep.equal({
            foo:"bar"
          , baz:"bing"
          , wibble : "wobble"
          , sausage : "chips"}
          )
      })

      it('should set the body', function() {
        address()
          .body({hello:"world!"})
          .body()
          .should.deep.equal({hello:"world!"})
      })

      it('should get a resource by name', function() {
        address.resource("wibble")
        web.resource.should.have.been.calledOnce
        web.resource.should.have.been.calledWith("wibble")
      })

      it('should call web.req with the configured request and callback', function() {
        var cb = sinon.spy()
          , req = {
            uri : "/wibble/123"
          , method : "send"
          , headers : {
              accept : "application/json"
            }
          , body : {hello:"world!"}
          }

        address("/wibble/{id}")
          .params("id", "123")
          .method("send")
          .accept("application/json")
          .body({hello:"world!"})
          .then(cb)

        web.req.should.have.been.calledOnce
        web.req.args[0][0].should.deep.equal(req)
        web.req.args[0][1].should.equal(cb)
      })

      it('should use defaults', function() {
        var cb = sinon.spy()
          , req = {
            uri : "/wibble"
          , method : "get"
          , headers : {
              accept : "application/x.nap.view"
            }
          , body : {}
          }

        address("/wibble").then(cb)

        web.req.should.have.been.calledOnce
        web.req.args[0][0].should.deep.equal(req)
        web.req.args[0][1].should.equal(cb)
      })

      it('should call nap.into with the node', function() {
        var cb = sinon.spy()
          , node = $("<div class='view'></div>")["0"]

        $("body").append(node)
        address("/wibble").into(node)
        $("body").remove(".view")

        web.req.should.have.been.calledOnce
        nap.into.should.have.been.calledOnce
        nap.into.should.have.been.calledWith(node)
      })
    })
  }
)