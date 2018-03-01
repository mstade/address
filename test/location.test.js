define(function(require) {
  var location = require('location')

  describe('Location', function() {
    var originalPath

    beforeEach(function() {
      originalPath = window.location.href.slice(window.location.origin.length)
      location.basePath('')
    })

    afterEach(function() {
      window.history.replaceState(null, null, originalPath)
    })

    describe('API', function() {
      describe(`location.getState()`, function() {
        it('should always get the current window location', function() {
          expect(location.getState() === '/base/foo')
          window.history.replaceState(null, null, '/base/bar')
          expect(location.getState() === '/base/bar')
        })

        it('should, if base path is set, remove it from current window location', function() {
          location.basePath('/base')
          expect(location.getState() === '/foo')
          window.history.replaceState(null, null, '/bar')
          expect(location.getState() === '/bar')
        })
      })

      describe(`location.basePath()`, function() {
        it('should replace the current path with a rebased path', function() {
          var historyEntries = window.history.length
          expect(location.getState()).to.equal(originalPath)
          location.basePath('/foo')
          expect(location.basePath()).to.equal('/foo')
          expect(location.getState()).to.equal(originalPath)
          expect(window.location.pathname).to.equal('/foo' + originalPath)
          expect(window.history.length).to.equal(historyEntries)

          location.basePath('/bar')
          expect(location.basePath()).to.equal('/bar')
          expect(location.getState()).to.equal(originalPath)
          expect(window.location.pathname).to.equal('/bar' + originalPath)
          expect(window.history.length).to.equal(historyEntries)

          location.basePath('/')
          expect(location.basePath()).to.equal('')
          expect(location.getState()).to.equal(originalPath)
          expect(window.location.pathname).to.equal(originalPath)
          expect(window.history.length).to.equal(historyEntries)

          location.basePath('')
          expect(location.basePath()).to.equal('')
          expect(location.getState()).to.equal(originalPath)
          expect(window.location.pathname).to.equal(originalPath)
          expect(window.history.length).to.equal(historyEntries)
        })
      })

      describe(`location.pushState()`, function() {
        var originalHref

        before(function() {
          originalHref = window.location.href
        })

        afterEach(function() {
          window.history.pushState(null, null, originalHref)
        })

        it('should update the current location', function() {
          expect(location.getState()).to.not.equal('/base/foo')
          expect(location.pushState('/base/foo')).to.equal('/base/foo')
          expect(location.getState()).to.equal('/base/foo')
        })

        it('should rebase accordingly when base path is set', function() {
          location.basePath('/base')
          expect(location.getState()).to.not.equal('/foo')
          expect(location.pushState('/base/foo')).to.equal('/foo')
          expect(location.getState()).to.equal('/foo')
          expect(location.pushState('/base/bar')).to.equal('/bar')
          expect(location.getState()).to.equal('/bar')
          expect(location.pushState('/baz')).to.equal('/baz')
          expect(location.getState()).to.equal('/baz')
        })

        it('should do nothing when pushing the current location', function() {
          expect(location.pushState(location.getState())).to.equal(false)

          location.basePath('/base')
          expect(location.pushState(location.getState())).to.equal(false)
        })

        it('should not dispatch events when pushing a new location', function() {
          var statechange = false

          location.on('statechange.test-no-dispatch', function() {
            statechange = true
          })

          expect(location.getState()).to.equal(originalPath)
          expect(location.pushState('/base/bar')).to.equal('/base/bar')
          expect(location.getState()).to.equal('/base/bar')
          expect(statechange).to.be.false

          location.basePath('/base')
          expect(location.getState()).to.equal('/bar')
          expect(location.pushState('/foo')).to.equal('/foo')
          expect(location.getState()).to.equal('/foo')
          expect(statechange).to.be.false

          location.on('statechange.test-no-dispatch', null)
        })

        it('should preserve query parameters', function() {
          var loc = window.location
          var originalQuery = new URLSearchParams(loc.search.substring(1))

          originalQuery.set('foo', 'bar')
          originalQuery.set('fizz', 'buzz')

          window.history.replaceState(
            null, null,
            loc.origin + loc.pathname + '?' + originalQuery.toString()
          )

          location.basePath('/base')
          location.getState()
          location.pushState('/base/foo')

          var newQuery = new URLSearchParams(window.location.search.substring(1))

          expect(newQuery.get('foo')).to.equal('bar')
          expect(newQuery.get('fizz')).to.equal('buzz')
        })
      })

      describe(`location.setState()`, function() {
        it('should do nothing when setting the current location', function() {
          var statechange = false

          location.on('statechange.test-no-op', function() {
            statechange = true
          })

          expect(location.setState(location.getState())).to.equal(false)
          expect(location.getState()).to.equal(originalPath)
          expect(statechange).to.be.false

          location.basePath('/base')
          expect(location.setState(location.getState())).to.equal(false)
          expect(location.getState()).to.equal(originalPath)
          expect(statechange).to.be.false

          location.on('statechange.test-no-op', null)
        })

        it('should dispatch an event when setting a new location', function() {
          var statechange = false

          location.on('statechange.test-dispatch', function() {
            statechange = true
          })

          expect(location.getState()).to.equal(originalPath)
          expect(location.setState('/base/bar')).to.equal('/base/bar')
          expect(location.getState()).to.equal('/base/bar')
          expect(statechange).to.be.true

          statechange = false

          location.basePath('/base')
          expect(location.getState()).to.equal('/bar')
          expect(location.setState('/foo')).to.equal('/foo')
          expect(location.getState()).to.equal('/foo')
          expect(statechange).to.be.true

          location.on('statechange.test-dispatch', null)
        })
      })

      describe(`location.openNewWindow()`, function() {
        it('should try to open a new window', function() {
          var path, target, opts
          window.open = function(x, y, z) {
            path = x
            target = y
            opts = z
          }

          location.openNewWindow('/base/foo', 'wibble')
          expect(path).to.equal('/base/foo')
          expect(target).to.equal('wibble')
          expect(opts).to.equal('')

          location.basePath('/base')
          location.openNewWindow('/foo', 'wibble')
          expect(path).to.equal('/base/foo')
          expect(target).to.equal('wibble')
          expect(opts).to.equal('')
        })
      })
    })

    describe('Events', function() {
      it('should "redirect" hashchanges locations to a real url', function() {
        var didRedirect

        location.on('statechange.test-redirect', function(state) {
          didRedirect = state
        })

        window.location.hash = '#/fancy/path'

        expect(didRedirect).to.equal('/fancy/path')
        expect(window.location.pathname).to.equal('/fancy/path')
        expect(window.location.hash).to.equal('')

        location.on('statechange.test-redirect', null)
      })

      it('should correctly deal with hashchanges where the hash is empty', function() {
        var didRedirect
        var currentPath = window.location.pathname
        var currentHash = window.location.hash

        location.on('statechange.test-redirect-empty-hash', function(state) {
          didRedirect = state
        })

        window.location.hash = '#'
        expect(didRedirect).to.equal(undefined)
        expect(window.location.pathname).to.equal(currentPath)
        expect(window.location.hash).to.equal('')
        window.location.hash = currentHash

        location.on('statechange.test-redirect-empty-hash', null)
      })

      xit('should correctly handle back/forward events', function() {
        expect(location.getState()).to.equal(originalPath)
        location.setState('/start')
        location.setState('/back')
        location.setState('/forward')

        var changedState
        location.on('statechange.test-history', function(state) {
          changedState = state
        })

        expect(location.getState()).to.equal('/forward')
        window.history.back()
        expect(changedState).to.eql({ base: '', path: '/back' })
        expect(location.getState()).to.equal('/back')

        changedState = undefined
        window.history.forward()
        expect(changedState).to.eql({ base: '', path: '/forward' })
        expect(location.getState()).to.equal('/forward')
        location.on('statechange.test-history', null)
      })

      describe(`location.handleClick()`, function() {
        var changedState, anchor, handledClick

        beforeEach(function() {
          anchor = document.createElement('a')
          document.body.appendChild(anchor)
          window.addEventListener('click', stopNavigation)
          location.on('statechange.test', function(state) {
            changedState = state
          })
        })

        afterEach(function() {
          document.body.removeChild(anchor)
          window.removeEventListener('click', stopNavigation)
          location.on('statechange.test', null)
          anchor = changedState = undefined
        })

        function stopNavigation(e) {
          e.preventDefault()
        }

        function click(target, opts) {
          opts || (opts = {})
          opts.view = window
          opts.bubbles = true
          opts.cancelable = true
          var event = new MouseEvent('click', opts)
          target.dispatchEvent(event)
        }

        it('should ignore ctrl+clicks', function() {
          anchor.href = '/foo'
          click(anchor, { ctrlKey: true })
          expect(changedState).to.be.undefined
        })

        it('should only care about primary button clicks (usually left click)', function() {
          anchor.href = '/foo'
          click(anchor, { button: 1 })
          expect(changedState).to.be.undefined
          click(anchor, { button: 2 })
          expect(changedState).to.be.undefined
          click(anchor, { button: 3 })
          expect(changedState).to.be.undefined
          click(anchor, { button: 4 })
          expect(changedState).to.be.undefined
          click(anchor, { button: 0 })
          expect(changedState).to.equal('/foo')
        })

        it('should only care about clicks on anchor elements', function() {
          click(document.body)
          expect(changedState).to.be.undefined
        })

        it('should ignore anchors which specify target', function() {
          anchor.href='/wibble'
          anchor.target = 'wibble'
          click(anchor)
          expect(changedState).to.be.undefined
        })

        it('should ignore anchors which specify a download attribute', function() {
          anchor.href='/wibble'
          anchor.setAttribute('download', '')
          click(anchor)
          expect(changedState).to.be.undefined

          anchor.setAttribute('download', 'something')
          click(anchor)
          expect(changedState).to.be.undefined
        })

        it('should only care about links of the same origin', function() {
          anchor.href = 'http://www.google.com'
          click(anchor)
          expect(changedState).to.be.undefined
        })

        it('should only care about hash if the first character of the hash is a `/`', function() {
          anchor.href = '#ignored'
          click(anchor)
          expect(changedState).to.be.undefined

          anchor.href = '#/backwards/compatible'
          click(anchor)
          expect(changedState).to.equal('/backwards/compatible')
        })

        it('should ignore empty hash links', function() {
          anchor.href = '#'
          click(anchor)
          expect(changedState).to.be.undefined
        })

        it('should ignore anchors with query parameters after the hash', function() {
          anchor.href = '#?query'
          click(anchor)
          expect(changedState).to.be.undefined

          anchor.href = '#?query=something'
          click(anchor)
          expect(changedState).to.be.undefined
        })
      })
    })
  })
})
