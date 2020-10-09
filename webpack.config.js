const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
module.exports=(env={})=>{
	const isDev = !env.production;
	const config = {
		entry: {
			app: './src/index.ts',
		},
		output: {
			pathinfo: false,
			filename: "meditor.js",
			library: "MEditor",
			libraryTarget: "umd",
			libraryExport: "default" 
		},
		mode:env.production?'production':'development',
		devServer: {
			hot:true,
			host:'0.0.0.0',
			port:8899,
			overlay:true,
			open:true,
			watchOptions:{
				aggregateTimeout: 1000,
				poll: 1000
			}
		},
		optimization: {
			minimizer: []
		},
		devtool: isDev?'eval-source-map':false,
		module: {
			rules: [
				{ 	
					test: /\.ts$/, 
					include: path.resolve(__dirname, 'src'),
					use: 'ts-loader' 
				},
				{ 	
					test: /\.css$/, 
					use: ['style-loader','css-loader'] 
				},
				{ 	
					test: /\.less$/, 
					include: path.resolve(__dirname, 'src'),
					use: ['style-loader','css-loader','less-loader'] 
				},
				{
					test: /\.(png|svg|jpg|gif)$/,
					use:"url-loader"
				},
				{
					test: /\.(woff|woff2|eot|ttf|otf)$/,
					use:"file-loader",
				},
			]
		},
		resolve:{
			alias:{
				"@":path.resolve("./src")
			},
			extensions: [ '.tsx', '.ts', '.js' ]
		},
		plugins: [ 
			new HtmlWebpackPlugin({
				template:'./index.html',
				title: '测试',
			}),
			new webpack.ProgressPlugin(),
			...(!isDev?[
				new CleanWebpackPlugin({
					root: path.resolve(__dirname, '../dist/')
				}),
				new CopyPlugin({
					patterns: [
						{
						  from: path.join(__dirname,'./public'),
						  to: path.join(__dirname,'./dist'),
						},
					]
				})
			]:[
				new webpack.HotModuleReplacementPlugin()
			])
		]
	};
	return config;
}