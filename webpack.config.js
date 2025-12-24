// webpack.config.js
const path = require('path');

module.exports = {
   module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // Add font loader for MapLibre
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      },
      // Add image loader for MapLibre
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      }
    ]
  },
  entry: {
   autocomplete :   './app/assets/javascripts/version_6/components/accessible-autocomplete.js',
   autocomplete_p :   './app/assets/javascripts/dataselector/components/accessible-autocomplete-p.js',
   autocomplete_v7 :   './app/assets/javascripts/version_7/components/accessible-autocomplete.js',
   autocomplete_pv7 :   './app/assets/javascripts/version_7/components/accessible-autocomplete-p-v7.js',
   autocomplete_pv8 :   './app/assets/javascripts/version_8/components/accessible-autocomplete-p-v8.js',

   // Data selector mvp
   autocomplete_pv_mvp :   './app/assets/javascripts/data-select-mvp/accessible-autocomplete-p-mvp.js',
   autocomplete_la_mvp :   './app/assets/javascripts/data-select-mvp/accessible-autocomplete.js',

   // Version 11
   autocomplete_p_11 :   './app/assets/javascripts/version_11/components/accessible-autocomplete-p-v8.js',
   autocomplete_la_11 :   './app/assets/javascripts/version_11/components/accessible-autocomplete.js',

    // Air Quality Map
    AQ_map : './app/assets/javascripts/version_11/air-quality-map.js',

      // Version 12
      autocomplete_p_12 :   './app/assets/javascripts/version_12/components/accessible-autocomplete-p-v8.js',
      autocomplete_la_12 :   './app/assets/javascripts/version_12/components/accessible-autocomplete.js',

      // Air Quality Map
      AQ_map_12 : './app/assets/javascripts/version_12/air-quality-map.js'
   },
    // Adjust if your entry file has a different path
  output: {
    path: __dirname,
    filename: './app/assets/javascripts/bundles/[name].bundle.js'
  },
  mode: 'development', // Use 'production' for optimized builds
};
