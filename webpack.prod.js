const webpack = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');

const path    = require('path');

module.exports = [
    {
        entry: path.join(__dirname, 'src/client/renderer.js'),
        output: {
            filename: 'renderer.bundle.js',
            path: path.join(__dirname, 'build/client/script')
        },
        node: {
            __dirname: false,
            __filename: false,
            console: true,
            fs: 'empty',
            net: 'empty',
            tls: 'empty'
        },
        plugins: [
            new webpack.EnvironmentPlugin('NODE_ENV'),
            new BabiliPlugin({
                "keepFnName": true
            })
        ],
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        plugins: [require('babel-plugin-transform-react-jsx')]
                    }
                }
            ]
        }
    },
    {
        target: "node",
        entry: path.join(__dirname, 'src/server/server.js'),
        output: {
            filename: 'server.bundle.js',
            path: path.join(__dirname, 'build/server')
        },
        node: {
            __dirname: false,
            __filename: false
        },
        plugins: [
            new webpack.EnvironmentPlugin('NODE_ENV'),
            new BabiliPlugin()
        ],
        externals: [require('webpack-node-externals')()]
    }
];