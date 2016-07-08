define(function(require) {
  var sinon = require('sinon')
    , zapp = require('z-app')
    , location = require('location')
    , address
    , web
    , nap
    , responseBody
    , response
    , a = require('address')
    , _ = require('underscore')


  describe('Address', function() {
      var originalPath

      beforeEach(function() {
        originalPath = window.location.href.slice(window.location.origin.length)

        responseBody = sinon.spy()

        response = {
          statusCode : 200
        , headers: {
            contentType : 'application/x.nap.view'
          }
        , body : responseBody
        }

        web = {
          req : sinon.spy(function(req, cb) {
            cb( null, response )
          })
        , uri : function(uri, params) {
            return _.template(uri, {interpolate: /\{(.+?)\}/g })(params)
          }
        , find: function() {
          }
        , use: function() {}
        }
        address = function(r) {
          return a(r).web(web)
        }
      })

      afterEach(function() {
        window.history.replaceState(null, null, originalPath)
      })

      it('should store the resource in the closure', function() {
        address('/wibble')
          .uri()
          .should.equal('/wibble')
      })

      it('should set the uri', function() {
        address()
          .uri('/wibble')
          .uri()
          .should.equal('/wibble')
      })

      it('should set the method', function() {
        address()
          .method('get')
          .method()
          .should.equal('get')
      })

      it('should set a header', function() {
        address()
          .header('accept', 'application/json')
          .header()
          .should.deep.equal({accept:'application/json'})
      })

      it('should set a the accept header to be application/json using the convenience method', function() {
        address()
          .json()
          .header()
          .should.deep.equal({accept:'application/json'})
      })

      it('should set a the accept header to be text/xml using the convenience method', function() {
        address()
          .xml()
          .header()
          .should.deep.equal({accept:'text/xml'})
      })

      it('should set a the accept header to be text/plain using the convenience method', function() {
        address()
          .text()
          .header()
          .should.deep.equal({accept:'text/plain'})
      })

      it('should set multiple headers', function() {
        address()
          .header('accept', 'application/json')
          .header('foo', 'bar')
          .header()
          .should.deep.equal({accept:'application/json', foo:'bar'})
      })

      it('should set multiple headers from an object', function() {
        address()
          .header({accept : 'application/json', foo : 'bar'})
          .header()
          .should.deep.equal({accept:'application/json', foo:'bar'})
      })

      it('should add a parameter', function() {
        address()
          .param('foo', 'bar')
          .param()
          .should.deep.equal({
            foo:'bar'
          })
      })

      it('should add a multiple parameters', function() {
        address()
          .param('foo', 'bar')
          .param('baz', 'bing')
          .param()
          .should.deep.equal({
            foo:'bar'
          , baz:'bing'
          })
      })

      it('should add a multiple parameters from an object', function() {
        address()
          .param({foo : 'bar', baz : 'bing'})
          .param()
          .should.deep.equal({
            foo:'bar'
          , baz:'bing'
          })
      })

      it('should add a multiple parameters from an object in a chain', function() {
        address()
          .param({foo : 'bar', baz : 'bing'})
          .param({wibble : 'wobble'})
          .param('sausage', 'chips')
          .param()
          .should.deep.equal({
            foo:'bar'
          , baz:'bing'
          , wibble : 'wobble'
          , sausage : 'chips'}
          )
      })

      it('should set the body', function() {
        address()
          .body({hello:'world!'})
          .body()
          .should.deep.equal({hello:'world!'})
      })

      it('should set fields from a req object', function() {
        var a = address({
          uri : '/wibble'
        , method : 'send'
        , query: { x: 'x'}
        , headers : {
            accept : 'application/json'
          }
        , body : 'hello'
        })

        a.uri().should.equal('/wibble')
        a.method().should.equal('send')
        a.header().should.deep.equal({accept:'application/json'})
        a.body().should.equal('hello')
        a.query().should.deep.equal({x: 'x'})
      })

      it('should call web.req with the configured request and callback', function() {
        var cb = sinon.spy()
          , req = {
            uri : '/wibble/123?a=a%3Db'
          , method : 'send'
          , headers : {
              accept : 'application/json'
            }
          , body : {hello:'world!'}
          , context: undefined
          , origin: undefined
          }

        var update = address('/wibble/{id}')
          .param('id', '123')
          .method('send')
          .query('a', 'a=b')
          .header('accept','application/json')
          .body({hello:'world!'})
          .on('done', cb)

        update()

        web.req.should.have.been.calledOnce
        web.req.should.have.been.calledWith(req)

        cb.should.have.been.calledOnce
      })

      it('should use defaults', function() {
        var cb = sinon.spy()
          , defaulReq = {
              uri : '/wibble'
            , method : 'get'
            , headers : {
                accept : 'application/x.nap.view'
              }
            , body : undefined
            , context: document.body
            , origin: undefined
            }

        expect(zapp.rootResource()).to.be.undefined
        expect(zapp.resource(zapp.root())).to.be.equal(zapp.rootResource())

        address('/wibble').on('done', cb)()

        web.req.should.have.been.calledOnce
        cb.should.have.been.calledOnce
        web.req.should.have.been.calledWith(defaulReq)
      })

      it('should call the response body with the node', function() {
        var cb = sinon.spy()
          , node = document.createElement('div')

        node.className = 'view'
        document.body.appendChild(node)
        // keep the deprecated syntax here for code coverage
        address('/wibble').into(node).then(cb)()

        document.body.removeChild(node)

        web.req.should.have.been.calledOnce
        cb.should.have.been.calledOnce
        responseBody.should.have.been.calledOnce
        responseBody.should.have.been.calledWith(node)
      })

      it('should update methods when shorthands are used', function() {
        var api = address()
          , body = {hello: 'world'}
        expect(api.get()).to.be.undefined
        api.method().should.equal('get')

        api = address()
        expect(api.post(body)).to.be.undefined
        api.method().should.equal('post')
        api.body().should.equal(body)

        api = address()
        expect(api.send(body)).to.be.undefined
        api.method().should.equal('send')
        api.body().should.equal(body)

        api = address()
        expect(api.put(body)).to.be.undefined
        api.method().should.equal('put')
        api.body().should.equal(body)

        api = address()
        expect(api.patch(body)).to.be.undefined
        api.method().should.equal('patch')
        api.body().should.equal(body)

        api = address()
        expect(api.remove(body)).to.be.undefined
        api.method().should.equal('remove')
        api.body().should.equal(body)
      })

      it('should update headers when shorthands are used', function() {
        var api = address()

        api.view().should.equal(api)
        api.header().should.deep.equal({accept: 'application/x.nap.view'})

        api = address()
        api.app().should.equal(api)
        api.header().should.deep.equal({accept: 'application/x.am.app'})

        api = address()
        api.stream().should.equal(api)
        api.header().should.deep.equal({accept: 'application/x.zap.stream'})

        api = address()
        api.json().should.equal(api)
        api.header().should.deep.equal({accept: 'application/json'})

        api = address()
        api.text().should.equal(api)
        api.header().should.deep.equal({accept: 'text/plain'})

        api = address()
        api.xml().should.equal(api)
        api.header().should.deep.equal({accept: 'text/xml'})
      })

      it('should navigate to the URI', function() {
        var uri = '/example'
          , req = {uri: uri}
          , api = address(req)
          , target = '_blank'

        var _open = window.open
        window.open = sinon.spy()

        api.target(target).should.equal(api)
        api.target().should.equal(target)
        api.navigate()
        expect(location.getState()).to.equal(originalPath)

        api.target(null)
        api.navigate().should.equal(location.getState())
        expect(location.getState()).to.equal(uri)

        api.method('post')
        expect(api.navigate()).should.not.equal(location.getState())

        window.open.calledOnce
        window.open.calledWith(uri, target)
        window.open = _open
      })

      it('should use the origin', function() {
        var uri = '/example'
          , api = address(uri)

        api.origin(uri).should.equal(api)
        api.origin().should.equal(uri)
      })

      it('should use the query', function() {
        var query1 = {a: 'a', b: 'b'}
          , query2 = {a: 'a', b: 'b', c: 'c'}
          , query3 = {d: 'd'}
          , api = address()

        api.query(query1).should.equal(api)
        api.query().should.deep.equal(query1)
        api.query(query2).should.equal(api)
        api.query().should.deep.equal(query2)
        api.query(query3).should.equal(api)
        api.query().should.deep.equal({a: 'a', b: 'b', c: 'c', d: 'd'})
      })

      it('should build query from uri', function() {
        var uri = '/foo?x=x'
          , api = address(uri)
          , query = { x: 'x' }

        api.query().should.deep.equal(query)
      })

      it('should merge queries', function() {
        var uri = '/foo?x=x'
          , api = address(uri).query({y: 'y&x=z'})
          , query = { x: 'x', y: 'y&x=z' }

        api.query().should.deep.equal(query)
        api.navigate().should.equal('/foo?x=x&y=y%26x%3Dz')
      })

      it('should overwrite queries in the resulting URI', function() {
        var uri = '/foo?x=x'
          , api = address(uri).query({x: '2'})
          , query = { x: '2' }

        api.query().should.deep.equal(query)
        api.navigate().should.equal('/foo?x=2')
      })

      it('should keep encoded path components', function() {
        var uri = '/foo/bar%2Fbaz'
          , api = address(uri)

        api.navigate().should.equal(uri)
      })

      it('should process encoded queries components', function() {
        var uri = '/fo?x=x&y=y%3Dy'
          , api = address(uri)
          , query = { x: 'x', y: 'y=y' }

        api.query().should.deep.equal(query)
        api.navigate().should.equal(uri)
      })

      it('should handle streams', function() {
        var cb = sinon.spy()
          , req = {
              uri : '/wibble'
              , method : 'get'
              , headers : {
                accept : 'application/x.zap.stream'
              }
              , context: zapp.root()
            }
          , dispatcher = sinon.spy()
          , doneSpy = sinon.spy()
        response.headers.contentType = 'application/x.zap.stream'
        response.body.dispatcher = dispatcher

        address(req).on('done', doneSpy)()
        doneSpy.should.have.been.calledOnce
        doneSpy.should.have.been.calledWith(response)
        response.body.should.equal(dispatcher)

        response.body = responseBody
        response.headers.contentType = '';
        response.statusCode = 600
        address(req)()
        response.body.should.equal(responseBody)
      })

      it('should err when missing URI', function() {
        var onBadRequest = sinon.spy()
          , onClientError = sinon.spy()

        address()
          .on('bad-request', onBadRequest)
          .on('client-error', onClientError)
          .get()

        onBadRequest.should.have.been.calledOnce
        onClientError.should.have.been.calledOnce
      })
    })
  }
)
