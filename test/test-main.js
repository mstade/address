var tests = Object.keys(window.__karma__.files).filter(
  function (file) {
    return /\.test\.js$/.test(file);
  }
)

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base',

  paths: {
    'logger/log' : "test/log",
    'd3': 'node_modules/d3-pkg/d3',
    'nap': 'node_modules/nap-ext-pkg/node_modules/nap/nap',
    'rhumb': 'node_modules/rhumb-pkg/node_modules/rhumb/dist/rhumb',
    'Squire': 'test/Squire',
    // 'Squire': 'node_modules/squirejs/src/Squire',
    'jquery': 'node_modules/jquery-pkg/node_modules/jquery/dist/jquery',
    'sinon': 'node_modules/sinon/pkg/sinon',
    'underscore' : 'node_modules/underscore-pkg/node_modules/underscore/underscore'
  },
    shim : {
        sinon: { exports: 'sinon' }
      , d3: { exports: 'd3' }
      , underscore: { exports: 'underscore'  }
      , nap: { deps: ['rhumb'], exports: 'nap' }
      , rhumb: { exports: 'rhumb' }
    }
})

require(tests, window.__karma__.start)

