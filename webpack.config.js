const path = require('path');
let webpackConfig = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    library: 'OREditor',
    libraryTarget: 'umd',
    libraryExport: 'default' // 默认导出
  },
  mode: "production",
  devtool: 'eval-source-map',
  stats: 'minimal',
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.join(__dirname, './src/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.(js|ts)$/,
        exclude: /(node_modules|bower_components)/,
        use: ['ts-loader']
      }, {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
    ]
  }
};

module.exports = webpackConfig;
