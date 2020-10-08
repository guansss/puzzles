const path = require('path');
const webpack = require('webpack');
const ThreeMinifierPlugin = require('@yushijinhun/three-minifier-webpack');
const threeMinifier = new ThreeMinifierPlugin();

module.exports = {
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
                test: /\.styl$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'stylus-loader',
                ],
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
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
        new webpack.IgnorePlugin({
            checkResource(resource, context) {
                if (process.env.NODE_ENV === 'production') {
                    // remove debug tools in production
                    return resource.match(/stats.js|dat.gui/);
                }

                return false;
            },
        }),
    ],
    devServer: {
        contentBase: __dirname,
        hot: true,
    },
};
