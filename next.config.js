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
  },
  
  // Production optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};
