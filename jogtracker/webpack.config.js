const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');


module.exports = {
  entry: {
    jogapp: "./index.js",
  },
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'jogapp'),
    filename: 'static/jogapp/jogapp.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['react', 'es2015']
        }
      }
    ]
  },
  context: path.join(__dirname, 'static_src'),
  plugins: [
    // To copy assets as it is from src/assets/ to build/assets
    // You don't need to explicitly import images in your js
    new CopyWebpackPlugin([
      {
        from: 'css',
        to: 'static/jogapp'
      },
      {
        from: 'index.html',
        to: 'templates/jogapp/index.html'
      }
    ],
      {
        ignore: [
          // Doesn't js files
          '*.js',
        ],
      }
    ),
  ],
  resolve: {
    // you can now require('file') instead of require('file.js')
    root: path.join(__dirname, 'static_src'),
    extensions: ['', '.js', '.jsx']
  }
};
