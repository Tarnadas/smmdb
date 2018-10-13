const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const path = require('path')

const { port, domain } = require('./environment')['dev']

module.exports = [
  {
    mode: 'development',
    target: 'node',
    entry: path.join(__dirname, '../src/server/index.ts'),
    output: {
      filename: 'index.js',
      path: path.join(__dirname, '../build/server')
    },
    devtool: 'inline-source-map',
    node: {
      __dirname: false,
      __filename: false
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development',
        IS_SERVER: true,
        PORT: port,
        DOMAIN: domain
      })
    ],
    externals: [require('webpack-node-externals')()],
    resolve: {
      extensions: [ '.ts', '.tsx', '.js', '.jsx', '.json' ],
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
                    ['@babel/env', {
                      targets: {
                        node: 'current'
                      },
                      modules: false
                    }],
                    '@babel/react'
                  ],
                  plugins: [
                    'react-loadable/babel',
                    '@babel/plugin-syntax-dynamic-import'
                  ]
                }
              }
            }
          ]
        }
      ]
    }
  }
]
