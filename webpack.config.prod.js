'use strict'
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {VueLoaderPlugin} = require('vue-loader')
const CopyPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
var webpack = require('webpack');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: [
        './src/js/app.js',
        './src/sass/app.scss',
    ],
    output: {
        path: path.resolve(__dirname, 'dist/www'),
        filename: 'js/app.js'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [
                        {
                            plugins: [
                                '@babel/plugin-proposal-class-properties'
                            ]
                        }
                    ]
                },
            },
            {
              test: /\.vue$/,
              use: 'vue-loader'
            },
            {
                test: /\.(s*)css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader",
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'imgs',
                        }
                    },
                ],
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    publicPath: '.fonts',
                }
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: "css/app.css"
        }),
        new CopyPlugin([
          { from: 'src/fonts', to: 'css/fonts' },
        ]),
        new CopyPlugin([
          { from: 'src/imgs', to: 'imgs' },
        ]),
    ],
    resolve: {
      alias: {
          'vue': 'vue/dist/vue.js',
        },
        extensions: ['*', '.js', '.json']
    },
}

module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
        SOCKETIOPORT: process.env.SOCKETIOPORT,
        APIPORT: process.env.APIPORT,
      }
    }),
  ])
