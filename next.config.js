// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  poweredByHeader: false,

  // Enable React compiler optimizations
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },

  // Production optimizations
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Enable compression
  compress: true,

  // Optimize bundle splitting
  experimental: {
    optimizePackageImports: ['@chakra-ui/react', 'framer-motion', 'recharts'],
  },
};
