const webpack = require('webpack')
const BabiliPlugin = require('babili-webpack-plugin')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = [
  {
    target: 'electron-renderer',
    entry: {
      renderer: ['babel-polyfill', path.join(__dirname, 'src/electron/renderer.js')]
    },
    output: {
      filename: 'renderer.js',
      path: path.join(__dirname, 'build/electron')
    },
    node: {
      __dirname: true,
      __filename: false,
      console: true,
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: process.env.NODE_ENV,
        ELECTRON: process.env.ELECTRON,
        CLIENT_VERSION: process.env.npm_package_clientVersion
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'build/static/views/template.html'
      }),
      new webpack.IgnorePlugin(/vertx/),
      new BabiliPlugin({
        keepFnName: true
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: path.join(__dirname, 'report_electron.html'),
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: path.join(__dirname, 'stats_electron.json')
      })
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
                  electron: '1.7.5'
                },
                modules: false,
                useBuiltIns: true
              }]
            ],
            plugins: ['transform-react-jsx']
          }
        },
        /* {
          test: /\.(png|jpg)$/,
          loader: 'url-loader',
          options: {
            limit: 25000
          }
        },
        {
          test: /\.(woff|ttf)$/,
          loader: 'url-loader',
          options: {
            limit: 25000,
            prefix: path.join(__dirname, 'build/static')
          }
        } */
      ]
    }
  },
  {
    target: 'electron',
    entry: path.join(__dirname, 'src/electron/index.js'),
    output: {
      filename: 'main.js',
      path: path.join(__dirname, 'build/electron')
    },
    node: {
      __dirname: false,
      __filename: false
    },
    plugins: [
      new webpack.EnvironmentPlugin('NODE_ENV'),
      new BabiliPlugin({
        keepFnName: true
      })
    ]
  }
]
