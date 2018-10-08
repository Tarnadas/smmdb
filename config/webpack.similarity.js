const webpack = require('webpack')

const path = require('path')

module.exports = [
  {
    mode: 'development',
    target: 'node',
    entry: path.join(__dirname, '../src/similarity/index.ts'),
    output: {
      filename: 'index.js',
      path: path.join(__dirname, '../build/similarity')
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
    ],
    externals: [require('webpack-node-externals')()],
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
                    ['@babel/env', {
                      targets: {
                        node: 'current'
                      },
                      modules: false
                    }]
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
