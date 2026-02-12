/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  // Ensure Three.js works properly with webpack
  webpack: (config) => {
    config.externals = config.externals || [];
    return config;
  },
  // Image optimization (unoptimized for static export)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
