const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    'babel-polyfill',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './src/index.jsx'
  ],
  module: {
		 rules: [
      // rules for modules (configure loaders, parser options, etc.)
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src')
        ],
				exclude: [/node_modules/],
				loader: 'babel-loader',
				options: {
					presets: ['latest', 'react']
				}
			},
			{
        test: /\.css$/,
        use: [
          'style',
          'css'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style',
          'css',
          'group-css-media-queries',
          'sass'
        ]
      },
      {
        test: /\.svg$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'assets', 'svg')
        ],
        use: ['react-svgdom', 'svgo']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        exclude: [
          path.resolve(__dirname, 'assets', 'svg')
        ],
        use: ['file']
      },
		 ]
  },

	// Where to resolve our loaders
  resolveLoader: {
    modules: [path.join(__dirname, 'node_modules')],
    moduleExtensions: ['-loader'],
  },

  resolve: {
    // Directories that contain our modules
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    descriptionFiles: ['package.json'],
    moduleExtensions: ['-loader'],
    // Extensions used to resolve modules
    extensions: ['.js', '.jsx', '.scss', '.css']
  },

  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './dist',
    hot: true
  },
  devtool: "source-map",
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}
