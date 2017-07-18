const webpack = require('webpack')
const BabiliPlugin = require('babili-webpack-plugin')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const WebpackMd5Hash = require('webpack-md5-hash')

const path = require('path')

module.exports = [
  {
    entry: {
      app: ['babel-polyfill', path.join(__dirname, 'src/client/renderer.js')],
      vendor: [
        'react', 'react-dom', 'react-redux', 'react-router', 'react-router-dom', 'react-router-redux', 'react-google-login', 'react-lazyload', 'react-custom-scrollbars',
        'redux', 'redux-immutable', 'immutable', 'history', 'bluebird', 'got', 'concat-stream'
      ]
    },
    output: {
      filename: 'app.[hash].js',
      path: path.join(__dirname, 'build/client/scripts')
    },
    node: {
      __dirname: false,
      __filename: false,
      console: true,
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty'
    },
    externals: [{
      electron: true
    }],
    plugins: [
      new WebpackMd5Hash(),
      new webpack.EnvironmentPlugin('NODE_ENV'),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: 'vendor.[hash].js'
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new BabiliPlugin({
        keepFnName: true
      }),
      new HtmlWebpackPlugin({
        filename: '../index.html',
        template: 'build/static/views/template.html'
      }),
      new ScriptExtHtmlWebpackPlugin({
        preload: /\.js/
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: path.join(__dirname, 'report.html'),
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: path.join(__dirname, 'stats.json')
      }),
      new webpack.IgnorePlugin(/^.*electron\/components.*$/)
    ],
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: [
              ['env', {
                targets: {
                  browsers: [
                    'last 2 versions'
                  ]
                },
                modules: false,
                useBuiltIns: true
              }]
            ],
            plugins: ['transform-react-jsx']
          }
        },
        {
          test: /\.html$/,
          loader: 'html-loader'
        }
      ]
    }
  },
  {
    target: 'node',
    entry: path.join(__dirname, 'src/server/index.js'),
    output: {
      filename: 'index.js',
      path: path.join(__dirname, 'build/server')
    },
    node: {
      __dirname: false,
      __filename: false
    },
    plugins: [
      new webpack.EnvironmentPlugin('NODE_ENV'),
      new BabiliPlugin(),
      new webpack.IgnorePlugin(/^.*electron\/components.*$/)
    ],
    externals: [require('webpack-node-externals')()],
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: [
              ['env', {
                targets: {
                  node: 'current'
                }
              }]
            ],
            plugins: ['transform-react-jsx']
          }
        }
      ]
    }
  }
]
