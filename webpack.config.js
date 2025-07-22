// webpack.config.js
const path = require('path');

module.exports = {
  entry: {
   autocomplete :   './app/assets/javascripts/version_6/components/accessible-autocomplete.js',
   autocomplete_v7 :   './app/assets/javascripts/version_7/components/accessible-autocomplete.js',
   autocomplete_p :   './app/assets/javascripts/dataselector/components/accessible-autocomplete-p.js',
   autocomplete_pv7 :   './app/assets/javascripts/version_7/components/accessible-autocomplete-p-v7.js'
   },
    // Adjust if your entry file has a different path
  output: {
    path: __dirname,
    filename: './app/assets/javascripts/bundles/[name].bundle.js'
  },
  mode: 'development', // Use 'production' for optimized builds
};
