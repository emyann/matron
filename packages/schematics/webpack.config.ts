import path from 'path';
import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import glob from 'glob';
import nodeExternals from 'webpack-node-externals';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

// Fetch all the entrypoints to respect angular schematics output structure
const files = glob.sync('./src/collection/**/*.ts', {
  ignore: ['./src/**/files/**/*', './src/**/*.spec.ts']
});
const entries = files.reduce<{ [path: string]: string }>((acc, file) => {
  const {
    groups: { filePath }
  } = /.\/src(?<filePath>\/.*).ts/.exec(file) as any;
  acc[filePath] = file;
  return acc;
}, {});

const config: webpack.Configuration = {
  target: 'node',
  externals: [nodeExternals({ modulesFromFile: true })],
  mode: 'production',
  entry: entries,
  output: {
    path: path.join(__dirname, '/dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs'
  },
  resolve: { extensions: ['.ts', '.js', '.json'] },
  module: {
    rules: [
      {
        test: /\.(js|mjs|ts)$/,
        exclude: [/node_modules/, /dist/],
        include: path.join(__dirname, '/src'),
        loader: 'babel-loader'
      }
    ]
  },

  plugins: [
    new CopyWebpackPlugin([
      <any>{
        from: './src/collection/**/*.json',
        test: /src\/(.+)\.json$/,
        to: './[1].[ext]'
      },
      {
        from: './src/collection.json'
      }
    ]),
    new ForkTsCheckerWebpackPlugin()
  ]
};

export default config;
