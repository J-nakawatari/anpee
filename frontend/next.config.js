/** @type {import('next').NextConfig} */
const nextConfig = {
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