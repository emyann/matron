import webpack from 'webpack';
import path from 'path';
import nodeExternals from 'webpack-node-externals';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const webpackconfiguration: webpack.Configuration = {
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  target: 'node',
  externals: [nodeExternals()],
  devtool: isProd ? 'hidden-source-map' : 'source-map',
  output: {
    filename: 'matron.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    sourceMapFilename: 'matron.map'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [{ test: /\.(ts|js)x?$/, use: ['babel-loader', 'source-map-loader'], exclude: /node_modules/ }]
  },
  plugins: [new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })]
};

export default webpackconfiguration;
