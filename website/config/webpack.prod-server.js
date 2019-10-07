const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const path = require('path')

const { port, domain } = require('./environment')['prod']

let credentials
try {
  credentials = require('./credentials')
} catch (err) {}
const googleClientId =
  process.env.GOOGLE_CLIENT_ID || credentials.googleClientId
const discordToken = process.env.DISCORD_TOKEN || credentials.discordToken

module.exports = [
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
        DOMAIN: domain,
        DOCKER: process.env.DOCKER,
        GOOGLE_CLIENT_ID: googleClientId,
        DISCORD_TOKEN: discordToken
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
