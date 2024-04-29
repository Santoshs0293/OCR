const path = require('path');
const webpack = require('webpack');

module.exports = {
    resolve: {
        fallback: {
            path: false, // Provide 'path' for dotenv
            os: false, // Provide 'os' for dotenv
            crypto: false, // Provide 'crypto' for dotenv
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser', // Provide 'process' for dotenv
            Buffer: ['buffer', 'Buffer'], // Provide 'Buffer' for dotenv
            path: 'path-browserify', // Provide 'path' for dotenv
            os: 'os-browserify/browser', // Provide 'os' for dotenv
            crypto: 'crypto-browserify', // Provide 'crypto' for dotenv
        }),
    ],
};
