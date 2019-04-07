const path = require("path");

module.exports = {
  entry: "./src/sonnet.ts",
  module: {
    rules: [
      { test: /\.ts$/, use: "awesome-typescript-loader", exclude: /node_modules/ }
    ]
  },
  output: {
    filename: "sonnet.js",
    path: path.resolve(__dirname, "dist")
  }
};
