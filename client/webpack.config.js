const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const precss = require("precss");
const autoprefixer = require("autoprefixer");

const assetsPath = path.resolve(__dirname, "src", "assets");
const distPath = path.resolve(__dirname, "dist");

/** @FIXME: SASS URL Path does not resolve correctly */
module.exports = {
  entry: {
    renderer: path.resolve(__dirname, "src", "renderer", "index.jsx"),
    background: path.resolve(__dirname, "src", "background", "background.jsx")
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js"
  },
  resolve: {
    alias: {
      assets: path.resolve(__dirname, "./assets")
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader" // Will reference .babelrc
        }
      },
      {
        test: /\.s?css$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: "css-loader",
              options: { url: false }
            },
            {
              // postcss-loader is for bootstrap to work
              loader: "postcss-loader", // Run post css actions
              options: {
                plugins() {
                  // post css plugins, can be exported to postcss.config.js
                  return [precss, autoprefixer];
                }
              }
            },
            {
              // For url() function in scss; This should be placed after sass-loader
              loader: "resolve-url-loader"
            },
            {
              loader: "sass-loader"
            }
          ],
          // use style-loader in development
          fallback: "style-loader"
        })
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: "file-loader?name=img/[name].[ext]",
            options: {
              emitFile: false
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "renderer", "index.html"),
      filename: "index.html",
      chunks: ["renderer"]
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "background", "background.html"),
      filename: "background.html",
      chunks: ["background"]
    }),
    new ExtractTextPlugin({
      filename: "style.css",
      disable: process.env.NODE_ENV === "development"
    }),
    new CopyWebpackPlugin([
      { from: assetsPath, to: path.resolve(distPath, "assets") }
    ])
  ]
};
