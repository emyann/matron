import webpack from 'webpack';

const config: webpack.Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js'
  }
};

export default config;
