const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const path = require('path')

const { port, domain } = require('./environment')['ver']

module.exports = [
  {
    mode: 'production',
    entry: {
      vendor: [
        'react-redux',
        'react-router',
        'react-router-dom',
        'react-router-redux',
        'react-google-login',
        'react-lazyload',
        'react-helmet',
        'redux',
        'redux-immutable',
        'axios',
        'node-emoji',
        'marked',
        'qrcode'
      ],
      app: [
        '@babel/polyfill',
        path.join(__dirname, '../src/client/renderer.tsx')
      ]
    },
    output: {
      filename: '[name].[chunkhash].js',
      path: path.join(__dirname, '../build/client/scripts'),
      publicPath: '/scripts/'
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
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            chunks: 'all',
            name: 'vendor',
            test: 'vendor',
            enforce: true,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: {
        name: 'manifest'
      }
    },
    plugins: [
      new webpack.HashedModuleIdsPlugin(),
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
        IS_SERVER: false,
        PORT: port,
        DOMAIN: domain
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new HtmlWebpackPlugin({
        filename: '../index.html',
        template: 'static/views/template.html'
      }),
      new ScriptExtHtmlWebpackPlugin({
        preload: /\.js/
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: path.join(__dirname, '../report.html'),
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: path.join(__dirname, '../stats.json')
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
                          browsers: ['> 1%', 'not ie > 0', 'not op_mini all']
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
  },
  {
    mode: 'production',
    target: 'node',
    devtool: 'source-map',
    entry: path.join(__dirname, '../src/server/index.ts'),
    output: {
      filename: 'index.js',
      path: path.join(__dirname, '../build/server')
    },
    node: {
      __dirname: false,
      __filename: false
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
        IS_SERVER: true,
        PORT: port,
        DOMAIN: domain
      })
    ],
    externals: [require('webpack-node-externals')()],
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: './tsconfig.json'
        })
      ]
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
                          node: 'current'
                        },
                        modules: false
                      }
                    ],
                    '@babel/react'
                  ],
                  plugins: ['@babel/plugin-syntax-dynamic-import']
                }
              }
            }
          ]
        }
      ]
    }
  }
]
