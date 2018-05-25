const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const build_path = path.resolve(__dirname, "build")
const src_path = path.resolve(__dirname, "src")

module.exports = {
  watch: true,
  target: 'web',
  context: src_path,
  entry: {
    index: "./index.js"
  },
  // Here the application starts executing and webpack starts bundling

  output: {
    path: build_path,
    // the target directory for all output files must be an absolute path
    // (use the Node.js path module)
    filename: "[name].js",
    // the filename template for entry chunks
    publicPath: "/javascripts/"
  },

  plugins: [
    new CopyWebpackPlugin([{
      from: src_path + '/assets',
      to: build_path + '/assets'
    }]),
    new HtmlWebpackPlugin({
      hash: true,
      template: 'index.pug'
    })
  ],
  module: {
    loaders: [{
      test: /\.css/,
      loaders: ['style-loader', 'css-loader']
    }]
  },
  node: {
    fs: 'empty',
    tls: 'empty'
  }
};
