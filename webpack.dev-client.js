const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')

const path = require('path')

const DEV_PORT = 80
const DEV_DOMAIN = 'http://localhost'

module.exports = [
  {
    entry: path.join(__dirname, 'src/client/renderer.tsx'),
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
      ]
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development',
        IS_SERVER: false,
        PORT: DEV_PORT,
        DOMAIN: DEV_DOMAIN
      }),
      new HtmlWebpackPlugin({
        filename: '../index.html',
        template: 'build/static/views/template.html'
      }),
      new ScriptExtHtmlWebpackPlugin({
        preload: /\.js/
      }),
      new webpack.IgnorePlugin(/^.*electron\/components.*$/)
    ],
    resolve: {
      extensions: [ '.ts', '.tsx', '.js', '.jsx', '.json' ]
    },
    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          loader: 'awesome-typescript-loader'
        },
        {
          test: /\.jsx?$/,
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
