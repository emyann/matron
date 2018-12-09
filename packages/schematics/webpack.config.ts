import path from 'path';
import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
const config: webpack.Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  plugins: [
    new CopyWebpackPlugin(
      [
        <any>{
          from: './src/collection/**/*.json',
          test: /src\/(.+)\.json$/,
          to: './[1].[ext]'
        },
        {
          from: './src/collection.json'
        }
      ],
      {}
    )
  ]
};

export default config;
