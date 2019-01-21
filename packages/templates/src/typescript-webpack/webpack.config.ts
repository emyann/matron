import path from 'path';
import webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const webpackconfiguration: webpack.Configuration = {
  entry: path.resolve(__dirname, 'src'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  module: {
    rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }]
  },
  plugins: [new ForkTsCheckerWebpackPlugin({ async: false })]
};

export default webpackconfiguration;
