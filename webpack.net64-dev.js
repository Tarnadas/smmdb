const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = [
  {
    target: 'electron-renderer',
    entry: {
      renderer: path.join(__dirname, 'src/net64/renderer.js')
    },
    output: {
      filename: 'renderer.js',
      path: path.join(__dirname, 'build/net64')
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
        NODE_ENV: 'development',
        IS_SERVER: false,
        NET64: true,
        NET64_VERSION: process.env.npm_package_net64Version
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'build/static/views/template_net64.html'
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
            babelrc: false,
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
    entry: path.join(__dirname, 'src/net64/index.js'),
    output: {
      filename: 'main.js',
      path: path.join(__dirname, 'build/net64')
    },
    devtool: 'inline-source-map',
    node: {
      __dirname: false,
      __filename: false
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development'
      })
    ]
  }
]
