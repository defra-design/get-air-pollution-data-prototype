// webpack.config.js
const path = require('path');

module.exports = {
  entry: {
   autocomplete :   './app/assets/javascripts/version_6/components/accessible-autocomplete.js'
   },
    // Adjust if your entry file has a different path
  output: {
    path: __dirname,
    filename: './app/assets/javascripts/bundles/[name].bundle.js'
  },
  mode: 'development', // Use 'production' for optimized builds
};
