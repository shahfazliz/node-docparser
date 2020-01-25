const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: 'node',
};
