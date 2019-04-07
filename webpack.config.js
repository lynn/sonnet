const path = require("path");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  entry: "./src/senot.ts",
  module: {
    rules: [
      { test: /\.ts$/, use: "awesome-typescript-loader", exclude: /node_modules/ }
    ]
  },
  output: {
    filename: "senot.js",
    path: path.resolve(__dirname, "dist")
  }
});
