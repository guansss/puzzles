const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ThreeMinifierPlugin = require('@yushijinhun/three-minifier-webpack');
const threeMinifier = new ThreeMinifierPlugin();

const config = {
    entry: './travel/travel.js',
    output: {
        filename: 'travel.min.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: '/build/',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        'plugins': [
                            '@babel/plugin-proposal-class-properties',
                        ],
                    },
                },
            },
            {
                test: /\.(styl|css)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: true,
                        },
                    },
                    'css-loader',
                    'stylus-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader',
                ],
            },
        ],
    },
    resolve: {
        plugins: [
            threeMinifier.resolver,
        ],
    },
    plugins: [
        threeMinifier,
        new MiniCssExtractPlugin({
            filename: 'index.css'
        }),
        new webpack.IgnorePlugin({
            checkResource(resource, context) {
                // remove debug tools
                return resource.match(/stats.js|dat.gui/);
            },
        }),
    ],
    devServer: {
        contentBase: __dirname,
        hot: true,
    },
};

module.exports = (env, argv) => {
    config.mode = argv.mode;

    if (argv.mode === 'development') {
        // keep debug tools in development mode
        config.plugins.splice(config.plugins.findIndex(p => p instanceof webpack.IgnorePlugin), 1);
    }

    return config;
};

