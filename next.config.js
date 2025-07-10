/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Add alias for src directory
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    
    // Fix for private class fields syntax in undici
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/undici/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-private-methods']
        }
      }
    });
    
    return config;
  },
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
