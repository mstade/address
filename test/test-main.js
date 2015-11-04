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
    , 'd3': 'node_modules/d3/d3'
    , '@websdk/nap': 'node_modules/@websdk/nap/lib/nap'
    , '@websdk/rhumb': 'node_modules/@websdk/rhumb/lib/rhumb'
    , 'Squire': 'test/Squire'
    , 'jquery': 'node_modules/jquery/dist/jquery'
    , 'sinon': 'node_modules/sinon/pkg/sinon'
    , 'underscore' : 'node_modules/underscore/underscore'
  }

  , shim: {
      sinon: { exports: 'sinon' }
    , d3: { exports: 'd3' }
    , underscore: { exports: 'underscore'  }
    , nap: { deps: ['rhumb'], exports: 'nap' }
    , rhumb: { exports: 'rhumb' }
  }

})

require(tests, window.__karma__.start)

