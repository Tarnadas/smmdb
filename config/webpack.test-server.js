const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const path = require('path')

const { port, domain } = require('./environment')['dev']

module.exports = [
  {
    mode: 'production',
    target: 'node',
    // devtool: 'source-map',
    entry: path.join(__dirname, '../src/server/test.tsx'),
    output: {
      filename: 'app.js',
      path: path.join(__dirname, '../build/test-server'),
      library: 'smmdb',
      libraryTarget: 'umd'
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
