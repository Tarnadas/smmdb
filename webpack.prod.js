const webpack = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');

const HtmlWebpackPlugin          = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const BundleAnalyzerPlugin       = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const path = require('path');

module.exports = [
    {
        entry: {
            app: path.join(__dirname, 'src/client/renderer.js'),
            vendor: ['react', 'react-dom', 'react-redux', 'react-router', 'react-router-dom', 'react-router-redux', 'react-google-login', 'redux', 'redux-immutable', 'immutable', 'history', 'bluebird']
        },
        output: {
            filename: 'app.[chunkhash].js',
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
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                filename: 'vendor.[chunkhash].js'
            }),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new BabiliPlugin({
                "keepFnName": true
            }),
            new HtmlWebpackPlugin({
                filename: '../views/index.html',
                template: 'build/client/views/template.html'
            }),
            new ScriptExtHtmlWebpackPlugin({
                preload: /\.js/
            }),
            new BundleAnalyzerPlugin()
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
                                        "last 2 versions"
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
        node: {
            __dirname: false,
            __filename: false
        },
        plugins: [
            new webpack.EnvironmentPlugin('NODE_ENV'),
            new BabiliPlugin()
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