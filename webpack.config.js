var webpack = require('webpack')
module.exports = {
  entry: './bundle.js'
, resolve: {
    alias: {
      // the idea is to remove this alias
      // once d3-utils is open sourced
      'd3-utils': './d3-utils'
    }
}
, output: {
    libraryTarget: 'umd'
  , library: 'address'
  , path: './lib'
  , filename: 'address.js'
  }
, externals: {
    'd3': 'd3'
  , 'underscore': {
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
  }
, devtool: '#source-map'
}
