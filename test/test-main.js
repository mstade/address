var tests = Object.keys(window.__karma__.files).filter(
  function (file) {
    return /\.test\.js$/.test(file);
  }
)

requirejs.config({

  // Karma serves files from '/base'
  baseUrl: '/base'

  , paths: {
      'logger/log' : "test/log"
    , '@websdk/nap': 'node_modules/@websdk/nap/lib/nap'
    , '@websdk/rhumb': 'node_modules/@websdk/rhumb/lib/rhumb'
    , 'Squire': 'node_modules/squirejs/src/Squire'
    , 'sinon': 'node_modules/sinon/pkg/sinon'
    , 'd3-dispatch': 'node_modules/d3-dispatch/build/d3-dispatch'
    , 'underscore' : 'node_modules/underscore/underscore'
    , 'lil-uri' : 'node_modules/lil-uri/uri'
  }

  , shim: {
      sinon: { exports: 'sinon' }
    , underscore: { exports: 'underscore'  }
    , nap: { deps: ['rhumb'], exports: 'nap' }
    , rhumb: { exports: 'rhumb' }
  }

})

require(tests, window.__karma__.start)

