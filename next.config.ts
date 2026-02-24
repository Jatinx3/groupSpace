/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // or "20mb" if you want
    },
  },
};

module.exports = nextConfig;