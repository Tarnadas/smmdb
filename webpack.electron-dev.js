const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = [
  {
    target: 'electron-renderer',
    entry: {
      renderer: path.join(__dirname, 'src/electron/renderer.js')
    },
    output: {
      filename: 'renderer.js',
      path: path.join(__dirname, 'build/electron')
    },
    devtool: 'inline-source-map',
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
      new webpack.IgnorePlugin(/vertx/)
    ],
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            plugins: ['transform-react-jsx']
          }
        },
        {
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
        }
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
    devtool: 'inline-source-map',
    node: {
      __dirname: false,
      __filename: false
    },
    plugins: [
      new webpack.EnvironmentPlugin('NODE_ENV')
    ]
  }
]
