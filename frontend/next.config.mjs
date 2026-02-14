/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure Three.js works properly with webpack
  webpack: (config) => {
    config.externals = config.externals || [];
    return config;
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
