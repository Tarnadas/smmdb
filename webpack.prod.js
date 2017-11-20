const webpack = require('webpack')
const BabiliPlugin = require('babili-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const path = require('path')

const PROD_PORT = 3000
const PROD_DOMAIN = 'https://smmdb.ddns.net'

module.exports = [
  {
    entry: {
      app: path.join(__dirname, 'src/client/renderer.js'),
      vendor: [
        'react', 'react-dom', 'react-redux', 'react-router', 'react-router-dom', 'react-router-redux', 'react-google-login', 'react-lazyload',
        'redux', 'redux-immutable', 'immutable', 'history', 'bluebird', 'got', 'concat-stream', 'filereader-stream', 'progress-stream', 'base64-arraybuffer',
        'node-emoji', 'qrcode', 'marked'
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
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
        IS_SERVER: false,
        PORT: PROD_PORT,
        DOMAIN: PROD_DOMAIN
      }),
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
            babelrc: false,
            presets: [
              ['env', {
                targets: {
                  browsers: [
                    '> 1%',
                    'last 2 versions',
                    'not ie < 11'
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
    devtool: 'source-map',
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
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
        IS_SERVER: true,
        PORT: PROD_PORT,
        DOMAIN: PROD_DOMAIN
      }),
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
            babelrc: false,
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
