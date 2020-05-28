const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const path = require('path')

const { port, domain, apiDomain } = require('./environment')['dev']

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
        DOMAIN: domain,
        API_DOMAIN: apiDomain
      }),
      new HtmlWebpackPlugin({
        filename: '../index.html',
        template: 'static/views/template.html'
      }),
      new ScriptExtHtmlWebpackPlugin({
        preload: /\.js/
      })
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: './tsconfig.json'
        })
      ]
    },
    watchOptions: {
      ignored: [/build\/.*/]
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
                    [
                      '@babel/env',
                      {
                        targets: {
                          browsers: [
                            'last 3 Chrome versions',
                            'last 2 ff versions'
                          ]
                        },
                        modules: false,
                        useBuiltIns: 'usage'
                      }
                    ],
                    '@babel/react'
                  ],
                  plugins: ['@babel/plugin-syntax-dynamic-import']
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
