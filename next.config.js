// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  poweredByHeader: false,
  eslint: {
    // Disable ESLint during build since there are configuration issues
    ignoreDuringBuilds: true,
  },
};
