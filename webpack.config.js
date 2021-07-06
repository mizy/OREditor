const path = require('path');
let webpackConfig = {
	entry: './src/index.js',
	output: {
		filename: 'index.js',
		library: 'OREditor',
		libraryTarget: 'umd',
		libraryExport: 'default' // 默认导出
	},
	mode:"production",
	devtool: 'eval-source-map',
	stats: 'minimal',
	module: {
		rules: [
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: ['file-loader']
			},
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: [ 'babel-loader' ]
			},	{
				test: /\.less$/,
				use: [ 'style-loader','css-loader','less-loader']
			},
		]
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src')
		}
	}

};

module.exports = webpackConfig;
