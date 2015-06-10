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
    'Squire': 'test/Squire',
    'nap': 'node_modules/nap-ext-pkg/node_modules/nap/nap',
    // 'Squire': 'node_modules/squirejs/src/Squire',
    'jquery': 'node_modules/jquery-pkg/node_modules/jquery/dist/jquery',
    'sinon': 'node_modules/sinon/pkg/sinon',
    'underscore' : 'node_modules/underscore-pkg/node_modules/underscore/underscore'
  },
    shim : {
        sinon: { exports: 'sinon' }
      , d3: { exports: 'd3' }
      , underscore: { exports: 'underscore'  }
    }
})

require(
  [
    'test/address.test'
  , 'test/parser.test'
  ], window.__karma__.start)

/*
logger/consoleShim: "/libraries/zap/logger/1.0.21/logger-min"
logger/log: "/libraries/zap/logger/1.0.21/logger-min"
logger/logConfiguration: "/libraries/zap/logger/1.0.21/logger-min"
logger/logGuards: "/libraries/zap/logger/1.0.21/logger-min"
logger/logger: "/libraries/zap/logger/1.0.21/logger-min"
logger/logging-config: "/libraries/zap/logger/1.0.21/logger-min"
logger/loggingInitialiser: "/libraries/zap/logger/1.0.21/logger-min"
logger/remoteLogger: "/libraries/zap/logger/1.0.21/logger-min"
*/
