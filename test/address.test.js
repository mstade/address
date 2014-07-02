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
      , reponse

    beforeEach(function(done) {

      var injector = new Squire();

      response = { 
        statusCode : 200
      , headers: {
          contentType : "application/x.nap.view"
        }
      , body : sinon.spy(function(node){console.log("view called")})
      }

      web = { 
        req : sinon.spy(function(req, cb) {
          cb( null, response )
        }) 
      , uri : function(uri, params) {
          var paramsString = ""
          Object.keys(params).forEach(function(key) {
            paramsString += "/" + params[key]
          })
          return uri.split("/{")[0] + paramsString
        }
      }

      nap = { 
        into : sinon.spy(function(node) {
          return function(err, res) {}
        }) 
      }

      type = { 
        isString : function(obj) { return typeof obj === "string" }
      , isObject : function(obj) { return typeof obj !== "string" }
      , isFunction : function(obj) { return true }
      }

      injector.mock(
        'web'
      , function() {
        return {
          load: function(name, req, onload, config) {
            onload(web)
          }
        }
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
      .mock(
        'logger/log!'
      , function() {
        return {
          load: function(name, req, onload, config) {
            onload(console)
          }
        }
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

      it('should set a header', function() {
        address()
          .header("accept", "application/json")
          .header()
          .should.deep.equal({accept:"application/json"})
      })

      it('should set a the accept header to be application/json using the convenience method', function() {
        address()
          .json()
          .header()
          .should.deep.equal({accept:"application/json"})
      })

      it('should set a the accept header to be text/xml using the convenience method', function() {
        address()
          .xml()
          .header()
          .should.deep.equal({accept:"text/xml"})
      })

      it('should set a the accept header to be text/plain using the convenience method', function() {
        address()
          .text()
          .header()
          .should.deep.equal({accept:"text/plain"})
      })

      it('should set multiple headers', function() {
        address()
          .header("accept", "application/json")
          .header("foo", "bar")
          .header()
          .should.deep.equal({accept:"application/json", foo:"bar"})
      })

      it('should set multiple headers from an object', function() {
        address()
          .header({accept : "application/json", foo : "bar"})
          .header()
          .should.deep.equal({accept:"application/json", foo:"bar"})
      })

      it('should add a parameter', function() {
        address()
          .param("foo", "bar")
          .param()
          .should.deep.equal({
            foo:"bar"
          })
      })

      it('should add a multiple parameters', function() {
        address()
          .param("foo", "bar")
          .param("baz", "bing")
          .param()
          .should.deep.equal({
            foo:"bar"
          , baz:"bing"
          })
      })

      it('should add a multiple parameters from an object', function() {
        address()
          .param({foo : "bar", baz : "bing"})
          .param()
          .should.deep.equal({
            foo:"bar"
          , baz:"bing"
          })
      })

      it('should add a multiple parameters from an object in a chain', function() {
        address()
          .param({foo : "bar", baz : "bing"})
          .param({wibble : "wobble"})
          .param("sausage", "chips")
          .param()
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

      it('should set fields from a req object', function() {
        var a = address({
          uri : "/wibble"
        , method : "send"
        , headers : {
            accept : "application/json"
          }
        , body : "hello"
        })
        
        a.uri().should.equal("/wibble")
        a.method().should.equal("send")
        a.header().should.deep.equal({accept:"application/json"})
        a.body().should.equal("hello")
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
          , context : undefined
          }

        var update = address("/wibble/{id}")
          .param("id", "123")
          .method("send")
          .header("accept","application/json")
          .body({hello:"world!"})
          .then(cb)

        update()

        web.req.should.have.been.calledOnce
        web.req.args[0][0].should.deep.equal(req)
        cb.should.have.been.calledOnce
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
          , context : undefined
          }

        address("/wibble").then(cb)()

        web.req.should.have.been.calledOnce
        cb.should.have.been.calledOnce
        web.req.args[0][0].should.deep.equal(req)
      })

      it('should call the respnse body with the node', function() {
        var cb = sinon.spy()
          , node = $("<div class='view'></div>")["0"]

        $("body").append(node)

        address("/wibble").into(node).then(cb)()

        $("body").remove(".view")

        web.req.should.have.been.calledOnce
        cb.should.have.been.calledOnce
        response.body.should.have.been.calledOnce
        response.body.should.have.been.calledWith(node)
      })
    })
  }
)