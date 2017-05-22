var webpack = require('webpack')
module.exports = {
  entry: './bundle.js'
, output: {
    libraryTarget: 'umd'
  , library: 'address'
  , path: './lib'
  , filename: 'address.js'
  }
, externals: {
    'underscore': {
      root: '_'
    , commonjs2: 'underscore'
    , commonjs: 'underscore'
    , amd: 'underscore'
    }
  , '@websdk/nap': {
      root: 'nap'
    , commonjs2: '@websdk/nap'
    , commonjs: '@websdk/nap'
    , amd: '@websdk/nap'
    }
  , '@websdk/rhumb': {
      root: 'rhumb'
    , commonjs2: '@websdk/rhumb'
    , commonjs: '@websdk/rhumb'
    , amd: '@websdk/rhumb'
    }
  , 'd3-dispatch': {
      root: 'd3_dispatch'
    , commonjs2: 'd3-dispatch'
    , commonjs: 'd3-dispatch'
    , amd: 'd3-dispatch'
    }
  }
, devtool: '#source-map'
}
