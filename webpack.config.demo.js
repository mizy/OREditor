const path = require("path");
const webpack = require("webpack");
const devMode = process.env.SYS_ENV !== "production";

module.exports = {
  cache: true,
  entry: {
    app: "./demo/index.js"
  },
  output: {
    filename: "index.js"
  },
  mode: "development",
  plugins: [
    new webpack.ProvidePlugin({
      React: "react"
    })
  ],
  devServer: {
    host: "0.0.0.0",
    port: "7780",
    open: true,
    openPage: "./index.html",
    contentBase: "./public",
    hot: true
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /(node_modules)|dist/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          {
            loader: "css-loader"
          },
          {
            loader: "less-loader"
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: "url-loader"
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader"
      }
    ]
  }
};
