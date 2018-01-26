const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: [
    path.resolve(__dirname, '../client/src/index.js'),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../client/dist'),
    publicPath: '/'
  },
  devtool: 'inline-source-map',
  plugins: [
    // new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'aaaaaa',
      template: './client/asset/index.html',
    }),
    
    // 打开浏览器
    new OpenBrowserPlugin({
      url: `http://localhost:3030`
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["env", "react"],
            plugins: ["transform-class-properties"],
          }
        },
        exclude: /node_module/,
      }, 
      // {
      //   test: /\.html$/,
      //   use: {
      //     loader: 'html-loader',
      //   }
      // }
    ]
  }
}