/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Next.js 15の新機能を有効化
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['images.unsplash.com'], // Unsplash画像用
    formats: ['image/webp', 'image/avif'],
  },
  // Figmaアセットのサポート
  webpack: (config) => {
    config.module.rules.push({
      test: /figma:asset/,
      type: 'asset/resource',
    });
    return config;
  },
};

module.exports = nextConfig;