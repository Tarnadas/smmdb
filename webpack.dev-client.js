const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')

const path = require('path')

const DEV_PORT = 80
const DEV_DOMAIN = 'http://localhost'

module.exports = [
  {
    entry: path.join(__dirname, 'src/client/renderer.js'),
    output: {
      filename: 'app.js',
      path: path.join(__dirname, 'build/client/scripts'),
      publicPath: '/scripts/'
    },
    devtool: 'inline-source-map',
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
    devServer: {
      proxy: [
        {
          context: ['/api', '/styles', '/img', '/courseimg', '/course64img', '/tokensignin', '/signin', '/signout'],
          target: 'http://localhost',
          secure: false
        }
      ]/* ,
      setup: function (app) {
        app.use('/:p', (req, res, next) => {
          if (!['/scripts', '/api', '/styles', '/img', '/courseimg', '/course64img', '/tokensignin', '/signin', '/signout'].includes(req.params.p)) {
            res.sendFile(path.join(__dirname, 'build/client/index.html'))
            return
          }
          next()
        })
      } */
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development',
        IS_SERVER: false,
        PORT: DEV_PORT,
        DOMAIN: DEV_DOMAIN
      }),
      // new webpack.optimize.ModuleConcatenationPlugin(),
      new HtmlWebpackPlugin({
        filename: '../index.html',
        template: 'build/static/views/template.html'
      }),
      new ScriptExtHtmlWebpackPlugin({
        preload: /\.js/
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
                    'last 3 Chrome versions',
                    'last 2 ff versions'
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
  }
]
