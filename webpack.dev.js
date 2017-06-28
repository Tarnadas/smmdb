const webpack = require('webpack');
const path    = require('path');

const HtmlWebpackPlugin          = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

module.exports = [
    {
        entry: path.join(__dirname, 'src/client/renderer.js'),
        output: {
            filename: 'app.js',
            path: path.join(__dirname, 'build/client/script')
        },
        devtool: 'inline-source-map',
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
            new webpack.optimize.ModuleConcatenationPlugin(),
            new HtmlWebpackPlugin({
                filename: '../views/index.html',
                template: 'build/client/views/template.html'
            }),
            new ScriptExtHtmlWebpackPlugin({
                preload: /\.js/
            })
        ],
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        presets: [
                            ["env", {
                                "targets": {
                                    "browsers": [
                                        "last 3 Chrome versions",
                                        "last 2 ff versions"
                                    ]
                                },
                                "modules": false,
                                "useBuiltIns": true
                            }]
                        ],
                        plugins: [require('babel-plugin-transform-react-jsx')]
                    }
                },
                {
                    test: /\.html$/,
                    loader: 'html-loader'
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
        devtool: 'inline-source-map',
        node: {
            __dirname: false,
            __filename: false
        },
        plugins: [
            new webpack.EnvironmentPlugin('NODE_ENV')
        ],
        externals: [require('webpack-node-externals')()],
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        presets: [
                            ["env", {
                                "targets": {
                                    "node": "current"
                                }
                            }]
                        ],
                        plugins: [require('babel-plugin-transform-react-jsx')]
                    }
                }
            ]
        }
    }
];