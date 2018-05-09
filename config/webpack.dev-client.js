const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const ReactLoadablePlugin = require('react-loadable/webpack').ReactLoadablePlugin
const ManifestPlugin = require('webpack-manifest-plugin')

const path = require('path')

const { port, domain } = require('./environment')['dev']

module.exports = [
  {
    mode: 'development',
    entry: path.join(__dirname, '../src/client/renderer.tsx'),
    output: {
      filename: 'app.js',
      path: path.join(__dirname, '../build/client/scripts'),
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
    optimization: {
      runtimeChunk: {
        name: 'manifest'
      }
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development',
        IS_SERVER: false,
        PORT: port,
        DOMAIN: domain
      }),
      new HtmlWebpackPlugin({
        filename: '../index.html',
        template: 'build/static/views/template.html'
      }),
      new ScriptExtHtmlWebpackPlugin({
        preload: /\.js/
      }),
      new ReactLoadablePlugin({
        filename: './build/react-loadable.json',
      }),
      new ManifestPlugin(),
      new webpack.IgnorePlugin(/^.*electron\/components.*$/)
    ],
    resolve: {
      extensions: [ '.ts', '.tsx', '.js', '.jsx', '.json' ]
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'awesome-typescript-loader',
              options: {
                useBabel: true,
                babelOptions: {
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
                  plugins: [
                    'react-loadable/babel',
                    'transform-react-jsx',
                    'syntax-dynamic-import'
                  ]
                }
              }
            }
          ]
        },
        {
          test: /\.html$/,
          loader: 'html-loader'
        }
      ]
    }
  }
]
