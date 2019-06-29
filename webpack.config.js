let webpack = require('webpack');
let HtmlPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let rules = require('./webpack.config.rules');
let path = require('path');

// rules.push({
//     test: /\.css$/,
//     use: ExtractTextPlugin.extract({
//         fallback: 'style-loader',
//         use: 'css-loader'
//     })
// });

rules.push({
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
            //publicPath: '../',
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader'],
        }),
    },
    {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader',
        }),
    });

module.exports = {
    entry: {
        index: './src/ymaps.js'
    },
    devServer: {
        contentBase: './dist'
    },
    output: {
        filename: '[name].js',
        path: path.resolve('dist'),
        publicPath: '/'
    },
    devtool: 'source-map',
    module: { rules },
    plugins: [
        //new CleanWebpackPlugin(['dist']),
        // new webpack.optimize.UglifyJsPlugin({
        //     sourceMap: true,
        //     compress: {
        //         drop_debugger: false,
        //         warnings: false
        //     }
        // }),
        new ExtractTextPlugin('./src/[name].css'),
        new HtmlPlugin({
            title: 'Yandex Maps',
            template: './src/index.hbs',
            filename: 'index.html',
            chunks: ['index']
        }),
        // new HtmlPlugin({
        //     title: 'towns',
        //     template: 'src/towns.hbs',
        //     //filename: 'towns.html',
        //     chunks: ['towns']
        // }),
    ]
};