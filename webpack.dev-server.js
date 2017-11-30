const webpack = require('webpack')

const path = require('path')

const DEV_PORT = 80
const DEV_DOMAIN = 'http://localhost'

module.exports = [
  {
    target: 'node',
    entry: path.join(__dirname, 'src/server/index.js'),
    output: {
      filename: 'index.js',
      path: path.join(__dirname, 'build/server')
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
        PORT: DEV_PORT,
        DOMAIN: DEV_DOMAIN
      }),
      new webpack.IgnorePlugin(/^.*electron\/components.*$/)
    ],
    externals: [require('webpack-node-externals')()],
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
                  node: 'current'
                }
              }]
            ],
            plugins: ['transform-react-jsx']
          }
        }
      ]
    }
  }
]
